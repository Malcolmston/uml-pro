"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { useParams } from "next/navigation";

import Class from "@/public/components/class/Class";

import Visibility from "@/public/components/visibility";

import CreateClass from "@/public/components/window/class/Create";
import CreateAbstract from "@/public/components/window/abstract/Create";
import CreateAnnotation from "@/public/components/window/annotation/Create";
import CreateInterface from "@/public/components/window/interface/Create";
import CreateRecord from "@/public/components/window/record/Create";

import Background from "./background";
import { getLatestProjectFile, getProjectFile, listProjectHistory, listTeams, storeProjectFile } from "./_api";

//import custom icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { byPrefixAndName } from '@awesome.me/kit-ab2f5093a4/icons'


export default function ProjectPage() {
    const params = useParams<{ id: string }>();
    const viewBox = { x: -100, y: -100, width: 1800, height: 1400 };
    const svgRef = useRef<SVGSVGElement | null>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSerializedRef = useRef<string>("");
    const [teamId, setTeamId] = useState<number | null>(null);
    const [loadedSvgMarkup, setLoadedSvgMarkup] = useState<string | null>(null);
    const [historyEntries, setHistoryEntries] = useState<Array<{ folder: string; pagePath?: string; previewPath?: string }>>([]);
    const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const projectId = useMemo(() => {
        const idValue = Number(params?.id);
        return Number.isFinite(idValue) ? idValue : null;
    }, [params?.id]);
    const [elements, setElements] = useState<React.ReactElement[]>([
        <Class
            key="class-1"
            name="User"
            x={100}
            y={100}
            params={[
                { name: "id", type: "long", visibility: Visibility.PRIVATE },
                { name: "username", type: "String", visibility: Visibility.PRIVATE },
                { name: "email", type: "String", visibility: Visibility.PRIVATE }
            ]}
            constants={[
                { name: "MAX_FAILED_LOGIN_ATTEMPTS", values: ["5"], type: "int", visibility: Visibility.PUBLIC, isStatic: true, isFinal: true }
            ]}
            constructors={[
                {
                    name: "User",
                    vis: Visibility.PUBLIC,
                    params: [
                        { name: "username", type: "String" },
                        { name: "email", type: "String" }
                    ]
                }
            ]}
            methods={[
                {
                    name: "getUsername",
                    returnType: "String",
                    visibility: Visibility.PUBLIC,
                    params: []
                },
                {
                    name: "setEmail",
                    returnType: "void",
                    visibility: Visibility.PUBLIC,
                    params: [{ name: "email", type: "String" }]
                }
            ]}
        />,
        <Class
            key="class-2"
            name="Profile"
            x={500}
            y={100}
            params={[
                { name: "bio", type: "String", visibility: Visibility.PRIVATE },
                { name: "avatarUrl", type: "String", visibility: Visibility.PRIVATE }
            ]}
            constants={[
                { name: "DEFAULT_AVATAR", values: ["\"default.png\""], type: "String", visibility: Visibility.PROTECTED, isStatic: true, isFinal: true }
            ]}
            constructors={[
                {
                    name: "Profile",
                    vis: Visibility.PUBLIC,
                    params: []
                }
            ]}
            methods={[
                {
                    name: "updateBio",
                    returnType: "void",
                    visibility: Visibility.PUBLIC,
                    params: [{ name: "newBio", type: "String" }]
                }
            ]}
        />
    ]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createType, setCreateType] = useState<
        "class" | "abstract" | "annotation" | "enum" | "interface" | "record"
    >("class");

    const connectors: React.ReactElement[] = [];

    const buttons: Array<React.ReactElement> = [
        (<button
            key={'create-class'}
            onClick={() => {
                setCreateType("class");
                setIsCreateOpen(true);
            }}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center group relative"
            title="Create New Class"
        >
            <FontAwesomeIcon icon={byPrefixAndName.fakd['class']} size="xl"/>
            <span
                className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Create New Class
            </span>
        </button>),

        (<button
            key={'create-abstract-class'}
            onClick={() => {
                setCreateType("abstract");
                setIsCreateOpen(true);
            }}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center group relative"
            title="Create New Abstract Class"
        >
            <FontAwesomeIcon icon={byPrefixAndName.fakd['abstract-class']} size="xl"/>
            <span
                className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Create New Abstract Class
            </span>
        </button>),

        (<button
            key={'create-annotation'}
            onClick={() => {
                setCreateType("annotation");
                setIsCreateOpen(true);
            }}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center group relative"
            title="Create New Annotation"
        >
            <FontAwesomeIcon icon={byPrefixAndName.fakd['annotation']} size="xl"/>
            <span
                className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Create New Annotation
            </span>
        </button>),

        (
            <button
                key={'create-enum'}
                onClick={() => {
                    setCreateType("enum");
                    setIsCreateOpen(true);
                }}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center group relative"
                title="Create New Enum"
            >
                <FontAwesomeIcon icon={byPrefixAndName.fakd['enum']} size="xl"/>
                <span
                    className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Create New Enum
                </span>
            </button>
        ),

        (
            <button
                key={'create-interface'}
                onClick={() => {
                    setCreateType("interface");
                    setIsCreateOpen(true);
                }}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center group relative"
                title="Create New Interface"
            >
                <FontAwesomeIcon icon={byPrefixAndName.fakd['interface']} size="2xl"/>
                <span
                    className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Create New Interface
                </span>
            </button>
        ),

        (
            <button
                key={'create-record'}
                onClick={() => {
                    setCreateType("record");
                    setIsCreateOpen(true);
                }}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center group relative"
                title="Create New Record"
            >
                <FontAwesomeIcon icon={byPrefixAndName.fakd['record']} size="2xl"/>
                <span
                    className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Create New Record
                </span>
            </button>
        ),

    ];
    const handleAddNode = (node: React.JSX.Element) => {
        setElements(prev => [...prev, node]);
        setIsCreateOpen(false);
    };

    useEffect(() => {
        let isActive = true;
        const resolveTeamAndHistory = async () => {
            if (!projectId) {
                setTeamId(null);
                setHistoryEntries([]);
                return;
            }
            try {
                const { teams } = await listTeams();
                for (const team of teams) {
                    if (!team.id) continue;
                    try {
                        const { history } = await listProjectHistory(team.id, projectId);
                        if (!isActive) return;
                        setTeamId(team.id);
                        setHistoryEntries(history);
                        const latest = history[0]?.pagePath;
                        if (latest) {
                            const stored = await getProjectFile(team.id, projectId, latest);
                            const svgText = atob(stored.contentBase64);
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(svgText, "image/svg+xml");
                            const svgElement = doc.documentElement;
                            setLoadedSvgMarkup(svgElement.innerHTML);
                            setElements([]);
                            setSyncStatus("saved");
                            return;
                        }
                        try {
                            const stored = await getLatestProjectFile(team.id, projectId);
                            const svgText = atob(stored.contentBase64);
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(svgText, "image/svg+xml");
                            const svgElement = doc.documentElement;
                            setLoadedSvgMarkup(svgElement.innerHTML);
                            setElements([]);
                            setSyncStatus("saved");
                        } catch (loadError) {
                            if (loadError instanceof Error && loadError.message.includes("No saved project")) {
                                setSyncStatus("idle");
                            } else {
                                throw loadError;
                            }
                        }
                        return;
                    } catch (innerError) {
                        if (innerError instanceof Error && innerError.message.includes("Project not found")) {
                            continue;
                        }
                        throw innerError;
                    }
                }
                if (isActive) {
                    setTeamId(null);
                    setHistoryEntries([]);
                }
            } catch (error) {
                if (isActive) {
                    console.error("Failed to resolve project team:", error);
                    setTeamId(null);
                    setHistoryEntries([]);
                    setSyncStatus("error");
                }
            }
        };

        void resolveTeamAndHistory();

        return () => {
            isActive = false;
        };
    }, [projectId]);

    const createPreviewPng = useCallback(async (svgText: string) => {
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);
        try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error("Failed to load SVG preview"));
                img.src = url;
            });

            const canvas = document.createElement("canvas");
            canvas.width = viewBox.width;
            canvas.height = viewBox.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Canvas context unavailable");
            }
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/png");
            return dataUrl.split(",")[1] || "";
        } finally {
            URL.revokeObjectURL(url);
        }
    }, [viewBox.height, viewBox.width]);

    const scheduleSave = useCallback(() => {
        if (!svgRef.current || !teamId || !projectId) return;
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        setSyncStatus("saving");
        saveTimeoutRef.current = setTimeout(async () => {
            if (!svgRef.current) return;
            const serialized = new XMLSerializer().serializeToString(svgRef.current);
            if (!serialized || serialized === lastSerializedRef.current) return;
            lastSerializedRef.current = serialized;
            const folderName = new Date().toISOString().replace(/[:.]/g, "-");
            try {
                setSyncStatus("saving");
                const previewBase64 = await createPreviewPng(serialized);
                await Promise.all([
                    storeProjectFile({
                        teamId,
                        projectId,
                        filePath: `${folderName}/page.svg`,
                        content: serialized,
                        encoding: "utf8",
                        mimeType: "image/svg+xml",
                    }),
                    storeProjectFile({
                        teamId,
                        projectId,
                        filePath: `${folderName}/preview.png`,
                        content: previewBase64,
                        encoding: "base64",
                        mimeType: "image/png",
                    })
                ]);
                setSyncStatus("saved");
                setLastSavedAt(new Date().toLocaleTimeString());
                try {
                    const { history } = await listProjectHistory(teamId, projectId);
                    setHistoryEntries(history);
                } catch (historyError) {
                    console.error("Failed to refresh history:", historyError);
                }
            } catch (error) {
                console.error("Failed to store project SVG:", error);
                setSyncStatus("error");
            }
        }, 800);
    }, [createPreviewPng, projectId, teamId]);

    useEffect(() => {
        if (!svgRef.current) return;
        const observer = new MutationObserver(() => {
            scheduleSave();
        });
        observer.observe(svgRef.current, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
        });
        return () => {
            observer.disconnect();
        };
    }, [scheduleSave]);

    useEffect(() => {
        scheduleSave();
    }, [scheduleSave]);


    const syncPill = useMemo(() => {
        switch (syncStatus) {
            case "saving":
                return { label: "Saving", classes: "bg-amber-100 text-amber-700 border-amber-200" };
            case "saved":
                return { label: "Saved", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" };
            case "error":
                return { label: "Error", classes: "bg-red-100 text-red-700 border-red-200" };
            default:
                return { label: "Idle", classes: "bg-gray-100 text-gray-600 border-gray-200" };
        }
    }, [syncStatus]);

    const formatHistoryLabel = useCallback((folder: string) => {
        const match = folder.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})(?:-(\d{3}))?Z$/);
        if (!match) return folder;
        const [, datePart, hour, minute, second, millis = "000"] = match;
        const iso = `${datePart}T${hour}:${minute}:${second}.${millis}Z`;
        const parsed = new Date(iso);
        if (Number.isNaN(parsed.getTime())) return folder;
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "short",
            timeStyle: "medium"
        }).format(parsed);
    }, []);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">
        {/* Sidebar/Toolbar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 shadow-sm z-10">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">UML Pro Dev</h1>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Project {params?.id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsHistoryOpen(true)}
                        className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800"
                        title="Project history"
                    >
                        <FontAwesomeIcon icon={byPrefixAndName.fas['clock-rotate-left']} />
                    </button>
                    <div className={`border px-2 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full ${syncPill.classes}`}>
                        {syncPill.label}
                    </div>
                </div>
            </div>
            {lastSavedAt && syncStatus === "saved" && (
                <p className="mt-2 text-[10px] text-gray-400">Last saved at {lastSavedAt}</p>
            )}

            {buttons}

        </div>

        {/* Main SVG Canvas */}
        <div className="flex-1 relative">
            <svg
                width="100%"
                height="100%"
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                xmlns="http://www.w3.org/2000/svg"

                className="cursor-grab active:cursor-grabbing"
                id="svg-background"
                ref={svgRef}
            >
                <Background viewBox={viewBox} />

                {loadedSvgMarkup ? (
                    <g dangerouslySetInnerHTML={{ __html: loadedSvgMarkup }} />
                ) : (
                    elements.map((element, index) => (
                        <g key={`element-${element.key || index}`} id={`element-${element.key || index}`}>
                            {element}
                        </g>
                    ))
                )}
                {/* Render connectors on top of elements */}
                {connectors.map((connector, idx) => (
                    <g key={`connector-${idx}`} id={`connector-${connector.key}`}>
                        {connector}
                    </g>
                ))}
            </svg>
        </div>

        {isCreateOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur"
                onClick={() => setIsCreateOpen(false)}
            >
                <div
                    className="w-full max-w-4xl"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="max-h-[85vh] overflow-y-auto">
                        {createType === "class" && (
                            <CreateClass
                                onAdd={handleAddNode}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        )}
                        {createType === "abstract" && (
                            <CreateAbstract
                                onAdd={handleAddNode}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        )}
                        {createType === "annotation" && (
                            <CreateAnnotation
                                onAdd={handleAddNode}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        )}
                        {createType === "interface" && (
                            <CreateInterface
                                onAdd={handleAddNode}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        )}
                        {createType === "record" && (
                            <CreateRecord
                                onAdd={handleAddNode}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
        )}

        {isHistoryOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur"
                onClick={() => setIsHistoryOpen(false)}
            >
                <div
                    className="w-full max-w-xl"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="p-6 bg-white rounded-lg shadow-lg w-full space-y-6 overflow-y-auto max-h-[85vh] border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">Project History</h2>
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-2">
                            {historyEntries.length === 0 && (
                                <p className="text-sm text-gray-500">No saved snapshots yet.</p>
                            )}
                            {historyEntries.length > 0 && (
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
                                    defaultValue=""
                                    onChange={async (event) => {
                                        const folder = event.target.value;
                                        const entry = historyEntries.find((item) => item.folder === folder);
                                        if (!entry || !teamId || !projectId || !entry.pagePath) return;
                                        try {
                                            const stored = await getProjectFile(teamId, projectId, entry.pagePath);
                                            const svgText = atob(stored.contentBase64);
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(svgText, "image/svg+xml");
                                            const svgElement = doc.documentElement;
                                            setLoadedSvgMarkup(svgElement.innerHTML);
                                            setElements([]);
                                            setIsHistoryOpen(false);
                                        } catch (error) {
                                            console.error("Failed to load selected SVG:", error);
                                        }
                                    }}
                                >
                                    <option value="" disabled>
                                        Select snapshot
                                    </option>
                                    {historyEntries.map((entry) => (
                                        <option key={entry.folder} value={entry.folder}>
                                            {formatHistoryLabel(entry.folder)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
