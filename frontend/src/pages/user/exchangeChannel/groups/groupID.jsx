"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import get from "lodash.get"; // thay rc-util cho an toàn

export default function GroupDetail() {
  const router = useRouter();
  const { groupId } = router.query;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // API lấy danh sách group
  const getAllGroup = async () => {
    const api = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exchange-channel/groups`;

    try {
      const res = await fetch(api);
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("API error:", error);
      return [];
    }
  };

  useEffect(() => {
    if (!groupId) return;

    const load = async () => {
      const groups = await getAllGroup();
      const found = groups.find((g) => g.id == groupId);

      setGroup(found || null);
      setLoading(false);
    };

    load();
  }, [groupId]);

  if (loading) return <div>Loading...</div>;

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{get(group, "attributes.name", "No Name")}</CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription>
          {get(group, "attributes.description", "No Description")}
        </CardDescription>
      </CardContent>

      <CardFooter>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  );
}
