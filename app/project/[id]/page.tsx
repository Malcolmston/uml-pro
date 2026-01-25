"use client";

import React, {useState} from 'react';
import { useParams } from "next/navigation";

import Class from "@/public/components/class/Class";

import Visibility from "@/public/components/visibility";

import CreateClass from "@/public/components/window/class/Create";
import CreateAbstract from "@/public/components/window/abstract/Create";
import CreateAnnotation from "@/public/components/window/annotation/Create";
import CreateEnum from "@/public/components/window/enum/Create";
import CreateInterface from "@/public/components/window/interface/Create";

import Background from "./background";

//import custom icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { byPrefixAndName } from '@awesome.me/kit-ab2f5093a4/icons'


export default function ProjectPage() {
    const params = useParams<{ id: string }>();
    const viewBox = { x: -100, y: -100, width: 1800, height: 1400 };
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
        "class" | "abstract" | "annotation" | "enum" | "interface"
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
        )

    ];
    const handleAddNode = (node: React.JSX.Element) => {
        setElements(prev => [...prev, node]);
        setIsCreateOpen(false);
    };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">
        {/* Sidebar/Toolbar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 shadow-sm z-10">
            <h1 className="text-xl font-bold text-gray-800 mb-2">UML Pro Dev</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Project {params?.id}</p>

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
            >
                <Background viewBox={viewBox} />

                {/* Render all elements */}
                {elements.map((element, index) => (
                    <g key={`element-${element.key || index}`} id={`element-${element.key || index}`}>
                        {element}
                    </g>
                ))}
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
                        {createType === "enum" && (
                            <CreateEnum
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
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
