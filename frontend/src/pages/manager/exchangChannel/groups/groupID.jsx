import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import get from "lodash.get";

export default function GroupDetail() {
  const router = useRouter();
  const { groupId } = router.query;
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const getAllGroup = async () => {
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
      <div className="">Group not found</div>
    );
  }

  return (
    <div>
      <div>
        {groups.map((group) => (
          <div key={group.id}>
            <Card>
              <CardHeader>
                <CardTitle>{get(group, "attributes.name", "No Name")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {get(group, "attributes.description", "No Description")}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="contained" color="primary">
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
