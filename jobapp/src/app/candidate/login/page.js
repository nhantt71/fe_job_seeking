"use client";

import Login from "../login";

export default function Home() {
    return (
        <div suppressHydrationWarning>
            <Login />
        </div>
    );
}