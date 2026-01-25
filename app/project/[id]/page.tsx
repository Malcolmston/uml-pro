"use client";

import React, {useState} from 'react';
import { useParams } from "next/navigation";
import Class from "@/public/components/class/Class";
import Visibility from "@/public/components/visibility";
import CreateClass from "@/public/components/window/class/Create";
import Background from "./background";

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
    const connectors: React.ReactElement[] = [];

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
            <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
                Create New Class
            </button>

            {isCreateOpen && (
                <div className="mt-4 border-t pt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <CreateClass onAdd={handleAddNode} onClose={() => setIsCreateOpen(false)} />
                </div>
            )}
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

    </div>
  );
}
