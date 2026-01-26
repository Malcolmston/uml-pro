"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";

import Class from "@/public/components/class/Class";

import Visibility from "@/public/components/visibility";

import CreateClass from "@/public/components/window/class/Create";
import CreateAbstract from "@/public/components/window/abstract/Create";
import CreateAnnotation from "@/public/components/window/annotation/Create";
import CreateInterface from "@/public/components/window/interface/Create";
import CreateRecord from "@/public/components/window/record/Create";

import Background from "./background";
import HistoryPopup from "./history";
import DiffView from "./diff";
import { getLatestProjectFile, getProjectFile, listProjectHistory, listTeamInvites, listTeams, storeProjectFile } from "./_api";
import TeamRole from "@/app/db/teamRole";

//import custom icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { byPrefixAndName } from '@awesome.me/kit-ab2f5093a4/icons'


export default function ProjectPage() {
    const params = useParams<{ id: string }>();
    const viewBox = { x: -100, y: -100, width: 1800, height: 1400 };
    const svgRef = useRef<SVGSVGElement | null>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSerializedRef = useRef<string>("");
    const historyCacheRef = useRef<Map<string, Array<{ folder: string; pagePath?: string; previewPath?: string }>>>(new Map());
    const fileCacheRef = useRef<Map<string, { contentBase64: string; mimeType: string }>>(new Map());
    const [teamId, setTeamId] = useState<number | null>(null);
    const [teamRole, setTeamRole] = useState<TeamRole | null>(null);
    const [loadedSvgMarkup, setLoadedSvgMarkup] = useState<string | null>(null);
    const [historyEntries, setHistoryEntries] = useState<Array<{ folder: string; pagePath?: string; previewPath?: string }>>([]);
    const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewLabel, setPreviewLabel] = useState<string>("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewTab, setPreviewTab] = useState<"preview" | "diff">("preview");
    const [latestSvgText, setLatestSvgText] = useState<string | null>(null);
    const [selectedSvgText, setSelectedSvgText] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isInvitesOpen, setIsInvitesOpen] = useState(false);
    const [invites, setInvites] = useState<Array<{ id: number | null; email: string; role: string; status?: string; createdAt: string | null }>>([]);
    const [invitesLoading, setInvitesLoading] = useState(false);
    const [invitesError, setInvitesError] = useState<string | null>(null);
    const isViewer = teamRole === TeamRole.VIEWER;
    const roleBadge = teamRole
        ? {
              label: teamRole,
              classes:
                  teamRole === TeamRole.ADMIN
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : teamRole === TeamRole.MEMBER
                        ? "bg-sky-100 text-sky-800 border-sky-200"
                        : "bg-slate-100 text-slate-600 border-slate-200",
          }
        : null;
    const latestSvgDataUrl = useMemo(() => {
        if (!latestSvgText) return null;
        return `data:image/svg+xml;utf8,${encodeURIComponent(latestSvgText)}`;
    }, [latestSvgText]);
    const selectedSvgDataUrl = useMemo(() => {
        if (!selectedSvgText) return null;
        return `data:image/svg+xml;utf8,${encodeURIComponent(selectedSvgText)}`;
    }, [selectedSvgText]);

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
    const actionButtons = isViewer ? [] : buttons;
    const handleAddNode = (node: React.JSX.Element) => {
        setElements(prev => [...prev, node]);
        setIsCreateOpen(false);
    };

    const getCachedHistory = useCallback((team: number, project: number) => {
        return historyCacheRef.current.get(`${team}:${project}`) ?? null;
    }, []);

    const setCachedHistory = useCallback((team: number, project: number, history: Array<{ folder: string; pagePath?: string; previewPath?: string }>) => {
        historyCacheRef.current.set(`${team}:${project}`, history);
    }, []);

    const getCachedFile = useCallback((team: number, project: number, path: string) => {
        return fileCacheRef.current.get(`${team}:${project}:${path}`) ?? null;
    }, []);

    const setCachedFile = useCallback((team: number, project: number, path: string, contentBase64: string, mimeType: string) => {
        fileCacheRef.current.set(`${team}:${project}:${path}`, { contentBase64, mimeType });
    }, []);

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
                        const cachedHistory = getCachedHistory(team.id, projectId);
                        if (cachedHistory && isActive) {
                            setHistoryEntries(cachedHistory);
                        }
                        const { history } = await listProjectHistory(team.id, projectId);
                        if (!isActive) return;
                        setCachedHistory(team.id, projectId, history);
                        setTeamId(team.id);
                        setTeamRole(team.role ?? null);
                        setHistoryEntries(history);
                        const latest = history[0]?.pagePath;
                        if (latest) {
                            const cached = getCachedFile(team.id, projectId, latest);
                            const stored = cached ?? await getProjectFile(team.id, projectId, latest);
                            if (!cached) {
                                setCachedFile(team.id, projectId, latest, stored.contentBase64, stored.mimeType);
                            }
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
                            setCachedFile(team.id, projectId, stored.filePath, stored.contentBase64, stored.mimeType);
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
                    setTeamRole(null);
                    setHistoryEntries([]);
                }
            } catch (error) {
                if (isActive) {
                    console.error("Failed to resolve project team:", error);
                    setTeamId(null);
                    setTeamRole(null);
                    setHistoryEntries([]);
                    setSyncStatus("error");
                }
            }
        };

        void resolveTeamAndHistory();

        return () => {
            isActive = false;
        };
    }, [getCachedFile, getCachedHistory, projectId, setCachedFile, setCachedHistory]);

    const createPreviewPng = useCallback(async (svgText: string) => {
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);
        try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = window.document.createElement("img");
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

    const saveSnapshot = useCallback(async (svgText: string, folderLabel?: string) => {
        if (isViewer) return;
        if (!teamId || !projectId) return;
        const previewBase64 = await createPreviewPng(svgText);
        const folderName = folderLabel || new Date().toISOString().replace(/[:.]/g, "-");
        await Promise.all([
            storeProjectFile({
                teamId,
                projectId,
                filePath: `${folderName}/page.svg`,
                content: svgText,
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
    }, [createPreviewPng, isViewer, projectId, teamId]);

    const scheduleSave = useCallback(() => {
        if (isViewer) return;
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
            try {
                setSyncStatus("saving");
                await saveSnapshot(serialized);
                setSyncStatus("saved");
                setLastSavedAt(new Date().toLocaleTimeString());
                try {
                    const { history } = await listProjectHistory(teamId, projectId);
                    setCachedHistory(teamId, projectId, history);
                    setHistoryEntries(history);
                } catch (historyError) {
                    console.error("Failed to refresh history:", historyError);
                }
            } catch (error) {
                console.error("Failed to store project SVG:", error);
                setSyncStatus("error");
            }
        }, 800);
    }, [isViewer, projectId, saveSnapshot, setCachedHistory, teamId]);

    useEffect(() => {
        if (isViewer) return;
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
    }, [isViewer, scheduleSave]);

    useEffect(() => {
        if (isViewer) return;
        scheduleSave();
    }, [isViewer, scheduleSave]);

    useEffect(() => {
        if (isViewer) return;
        if (!isInvitesOpen || !teamId) return;
        let active = true;
        const loadInvites = async () => {
            setInvitesLoading(true);
            setInvitesError(null);
            try {
                const { invites } = await listTeamInvites(teamId);
                if (active) {
                    setInvites(invites.map((invite) => ({
                        ...invite,
                        createdAt: invite.createdAt ?? null,
                    })));
                }
            } catch (error) {
                if (active) {
                    setInvitesError(error instanceof Error ? error.message : "Failed to load invites.");
                }
            } finally {
                if (active) {
                    setInvitesLoading(false);
                }
            }
        };
        void loadInvites();
        return () => {
            active = false;
        };
    }, [isInvitesOpen, isViewer, teamId]);

    useEffect(() => {
        if (!isViewer) return;
        setIsCreateOpen(false);
        setIsHistoryOpen(false);
        setIsInvitesOpen(false);
        setIsPreviewOpen(false);
    }, [isViewer]);


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
        {!isViewer && isSidebarOpen && (
        <div className="w-64 h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-4 shadow-sm z-10 overflow-hidden">
            <div className="flex flex-col gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">UML Pro Dev</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Project {params?.id}</p>
                        {roleBadge && (
                            <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] rounded-full ${roleBadge.classes}`}>
                                {roleBadge.label}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/dashboard"
                        className="h-8 px-3 rounded-full border border-gray-200 text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:border-gray-400 hover:text-gray-800"
                    >
                        Home
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className="h-8 px-2 rounded-full border border-gray-200 text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:border-gray-400 hover:text-gray-800"
                        title="Hide sidebar"
                    >
                        Hide
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsHistoryOpen(true)}
                        className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800"
                        title="Project history"
                    >
                        <FontAwesomeIcon icon={byPrefixAndName.fas['clock-rotate-left']} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsInvitesOpen(true)}
                        className="h-8 px-3 rounded-full border border-gray-200 text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:border-gray-400 hover:text-gray-800"
                        title="Team invites"
                    >
                        Invites
                    </button>
                    <div className={`border px-2 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full ${syncPill.classes}`}>
                        {syncPill.label}
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="flex flex-col gap-3">
                    {actionButtons}
                </div>
            </div>
            {lastSavedAt && syncStatus === "saved" && (
                <p className="text-[10px] text-gray-400">Last saved at {lastSavedAt}</p>
            )}

        </div>
        )}

        {/* Main SVG Canvas */}
        <div className="flex-1 relative">
            {!isViewer && !isSidebarOpen && (
                <div className="absolute left-4 top-4 z-20">
                    <Link
                        href="/dashboard"
                        className="mr-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-600 shadow-sm hover:border-gray-400 hover:text-gray-800"
                    >
                        Home
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-600 shadow-sm hover:border-gray-400 hover:text-gray-800"
                        title="Show sidebar"
                    >
                        Menu
                    </button>
                </div>
            )}
            {isViewer && roleBadge && (
                <div className="absolute left-4 top-4 z-20">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-600 shadow-sm hover:border-gray-400 hover:text-gray-800"
                        >
                            Home
                        </Link>
                        <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] rounded-full ${roleBadge.classes}`}>
                            {roleBadge.label}
                        </span>
                    </div>
                </div>
            )}
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

        {!isViewer && isCreateOpen && (
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

        {!isViewer && (
        <HistoryPopup
            isOpen={isHistoryOpen}
            entries={historyEntries}
            formatLabel={formatHistoryLabel}
            onClose={() => setIsHistoryOpen(false)}
            onSelect={async (entry) => {
                if (!teamId || !projectId || !entry.pagePath) return;
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
            onPreview={async (entry) => {
                if (!teamId || !projectId) return;
                try {
                    if (entry.previewPath) {
                        const cachedPreview = getCachedFile(teamId, projectId, entry.previewPath);
                        const storedPreview = cachedPreview ?? await getProjectFile(teamId, projectId, entry.previewPath);
                        if (!cachedPreview) {
                            setCachedFile(teamId, projectId, entry.previewPath, storedPreview.contentBase64, storedPreview.mimeType);
                        }
                        const dataUrl = `data:${storedPreview.mimeType};base64,${storedPreview.contentBase64}`;
                        setPreviewImage(dataUrl);
                    } else {
                        setPreviewImage(null);
                    }

                    if (entry.pagePath) {
                        const cachedSelected = getCachedFile(teamId, projectId, entry.pagePath);
                        const storedSelected = cachedSelected ?? await getProjectFile(teamId, projectId, entry.pagePath);
                        if (!cachedSelected) {
                            setCachedFile(teamId, projectId, entry.pagePath, storedSelected.contentBase64, storedSelected.mimeType);
                        }
                        setSelectedSvgText(atob(storedSelected.contentBase64));
                    } else {
                        setSelectedSvgText(null);
                    }

                    const storedLatest = await getLatestProjectFile(teamId, projectId);
                    setCachedFile(teamId, projectId, storedLatest.filePath, storedLatest.contentBase64, storedLatest.mimeType);
                    setLatestSvgText(atob(storedLatest.contentBase64));

                    setPreviewLabel(formatHistoryLabel(entry.folder));
                    setPreviewTab("preview");
                    setIsPreviewOpen(true);
                } catch (error) {
                    console.error("Failed to load preview image:", error);
                }
            }}
            onRevert={async (entry) => {
                if (!teamId || !projectId || !entry.pagePath) return;
                try {
                    const cached = getCachedFile(teamId, projectId, entry.pagePath);
                    const stored = cached ?? await getProjectFile(teamId, projectId, entry.pagePath);
                    if (!cached) {
                        setCachedFile(teamId, projectId, entry.pagePath, stored.contentBase64, stored.mimeType);
                    }
                    const svgText = atob(stored.contentBase64);
                    const folderLabel = `${entry.folder}-reverted`;
                    await saveSnapshot(svgText, folderLabel);
                    setLoadedSvgMarkup(null);
                    setElements([]);
                    setSyncStatus("saved");
                    setLastSavedAt(new Date().toLocaleTimeString());
                    const { history } = await listProjectHistory(teamId, projectId);
                    setCachedHistory(teamId, projectId, history);
                    setHistoryEntries(history);
                } catch (error) {
                    console.error("Failed to revert snapshot:", error);
                }
            }}
        />
        )}

        {!isViewer && isPreviewOpen && (
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur"
                onClick={() => setIsPreviewOpen(false)}
            >
                <div
                    className="h-full w-full"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="bg-white h-full w-full border overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={byPrefixAndName.fawsb["images"]} />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Snapshot preview</h2>
                                    <p className="text-xs text-gray-500">{previewLabel}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!selectedSvgText) return;
                                        try {
                                            const folderLabel = `${previewLabel}-reverted`;
                                            await saveSnapshot(selectedSvgText, folderLabel);
                                            setSyncStatus("saved");
                                            setLastSavedAt(new Date().toLocaleTimeString());
                                            const { history } = await listProjectHistory(teamId as number, projectId as number);
                                            setHistoryEntries(history);
                                        } catch (error) {
                                            console.error("Failed to revert snapshot:", error);
                                        }
                                    }}
                                    className="h-9 w-9 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800"
                                    title="Revert to this snapshot"
                                >
                                    <FontAwesomeIcon icon={byPrefixAndName.fawsb["arrow-rotate-left"]} />
                                </button>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-b">
                            <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setPreviewTab("preview")}
                                    className={`px-3 py-1 rounded-full transition ${previewTab === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                                >
                                    Preview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewTab("diff")}
                                    className={`px-3 py-1 rounded-full transition ${previewTab === "diff" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                                >
                                    Diff
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
                            {previewTab === "preview" && (
                                <>
                                    <div className="rounded-lg border border-dashed border-gray-200 p-6 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:24px_24px] min-h-[320px] flex items-center justify-center">
                                        {selectedSvgDataUrl ? (
                                            <Image
                                                src={selectedSvgDataUrl}
                                                alt="Selected snapshot"
                                                className="max-h-[360px] max-w-full"
                                                width={720}
                                                height={360}
                                            />
                                        ) : (
                                            <div className="text-xs text-gray-500">No selected snapshot.</div>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        {previewImage ? (
                                            <Image
                                                src={previewImage}
                                                alt="Project preview"
                                                className="w-40 max-w-full rounded-md border border-gray-200"
                                                width={160}
                                                height={120}
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-500">No preview available.</div>
                                        )}
                                    </div>
                                </>
                            )}
                            {previewTab === "diff" && (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-dashed border-gray-200 p-6 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:24px_24px] min-h-[320px] grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className="flex flex-col gap-2">
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Current</div>
                                            <div className="flex-1 rounded-md border border-gray-200 bg-white p-3 flex items-center justify-center">
                                                {latestSvgDataUrl ? (
                                                    <Image
                                                        src={latestSvgDataUrl}
                                                        alt="Current snapshot"
                                                        className="max-h-[320px] max-w-full"
                                                        width={640}
                                                        height={320}
                                                    />
                                                ) : (
                                                    <div className="text-xs text-gray-500">No current snapshot.</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Selected</div>
                                            <div className="flex-1 rounded-md border border-gray-200 bg-white p-3 flex items-center justify-center">
                                                {selectedSvgDataUrl ? (
                                                    <Image
                                                        src={selectedSvgDataUrl}
                                                        alt="Selected snapshot"
                                                        className="max-h-[320px] max-w-full"
                                                        width={640}
                                                        height={320}
                                                    />
                                                ) : (
                                                    <div className="text-xs text-gray-500">No selected snapshot.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-h-[260px]">
                                        {latestSvgText && selectedSvgText ? (
                                            <DiffView latest={latestSvgText} previous={selectedSvgText} />
                                        ) : (
                                            <div className="text-xs text-gray-500">Diff data unavailable.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {isInvitesOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur"
                onClick={() => setIsInvitesOpen(false)}
            >
                <div
                    className="w-full max-w-xl"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="p-6 bg-white rounded-lg shadow-lg w-full space-y-6 overflow-y-auto max-h-[85vh] border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">Team invites</h2>
                            <button
                                onClick={() => setIsInvitesOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        {invitesLoading && <p className="text-sm text-gray-500">Loading invites...</p>}
                        {invitesError && <p className="text-sm text-red-500">{invitesError}</p>}
                        {!invitesLoading && invites.length === 0 && (
                            <p className="text-sm text-gray-500">No pending invites.</p>
                        )}
                        <div className="space-y-3">
                            {invites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700"
                                >
                                    <div className="font-semibold text-gray-900">{invite.email}</div>
                                    <div className="text-xs text-gray-500">
                                        Role: {invite.role} · {invite.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
