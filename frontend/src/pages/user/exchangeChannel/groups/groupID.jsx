import { Card } from "@/components/ui/card";
import { useRouter } from "next/router";
import { get } from "rc-util";
import { get } from "rc-util";

export default async function GroupDetail() {
  const router = useRouter();
  const { groupId } = router.query;

  const getAllGroup = async () => {
    const getAllGroupApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exchange-channel/groups`;

    try {
      const response = await fetch(getAllGroupApi);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const groups = await getAllGroup();
  if (!group) {
    return (
      <div class="">Group not found</div>
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
