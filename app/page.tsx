"use client";

import React, {useEffect, useState} from 'react';
import Class from "@/public/components/class/Class";
import Visibility from "@/public/components/visibility";


export const Background = ({viewBox}: {viewBox: {x: number, y: number, width: number, height: number} }) => (
    <>
        <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
            <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
            </pattern>
        </defs>

        <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.width + 2000} height={viewBox.height + 2000}
              fill="url(#grid)" style={{pointerEvents: 'none'}}/>
        <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.width + 2000} height={viewBox.height + 2000}
              fill="url(#grid-major)" style={{pointerEvents: 'none'}}/>
    </>
);

export default function Home() {
    const [viewBox, setViewBox] = useState({ x: -100, y: -100, width: 1800, height: 1400 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [elements, setElements] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        setElements([
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
    }, []);
    const [connectors, setConnectors] = useState<React.ReactElement[]>([]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

        {/* Main SVG Canvas */}
        <div className="w-full h-full">
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
                    <g key={`element-${index}`} id={`element-${element.key}`}>
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
