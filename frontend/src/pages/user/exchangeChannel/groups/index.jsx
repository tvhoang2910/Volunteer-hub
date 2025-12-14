import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import get from "lodash.get";

export default function GroupsList() {
    const router = useRouter();
    // Removed unused groupId query since this is a list page
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const getAllGroup = async () => {
            // Ensure the API URL is correct. Assuming environmental variable is set.
            // API lấy danh sách các nhóm trao đổi của người dùng
            const getAllGroupApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exchange-channel/groups`;

            try {
                const response = await fetch(getAllGroupApi);
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setGroups(data);
            } catch (error) {
                console.error(error);
                setGroups([]);
            }
        };
        getAllGroup();
    }, []);

    if (!groups || groups.length === 0) {
        return (
            <div className="p-4 text-center">Group not found</div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                    <div key={group.id} className="h-full">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>{get(group, "attributes.name", "No Name")}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>
                                    {get(group, "attributes.description", "No Description")}
                                </CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="default" // Changed 'contained' to 'default' as 'contained' is MaterialUI prop, Shadcn usually uses 'default' or 'secondary'
                                    className="w-full"
                                    onClick={() => router.push(`/user/exchangeChannel/groups/${group.id}`)}
                                >
                                    View Details
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
