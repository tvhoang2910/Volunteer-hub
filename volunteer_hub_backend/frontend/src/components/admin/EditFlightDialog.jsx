import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import axios from "axios";

export function EditFlightDialog({ flight, onClose, onSave }) {
  const [editedFlight, setEditedFlight] = useState(flight)

  const handleInputChange = (e) => {
    const { name, value } = e.target ? e.target : { name: e.name, value: e };
    setEditedFlight(prev => ({ ...prev, [name]: value }))
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    const editFlightApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/flight/update?id=${editedFlight.flightId}`
  
    try {
        // const response = await fetch(editFlightApi, {
        //     method: "PUT",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "admin": "true",
        //         "authorization": "Bearer " + localStorage.getItem("token")
        //     },
        //     body: JSON.stringify({
        //         "arrivalTime": {"seconds": Date.parse(editedFlight.arrivalTime)/1000},
        //         "departureTime": {"seconds": Date.parse(editedFlight.departureTime)/1000},
        //     })
        // })
        const response = await axios.put(editFlightApi,
            {
                "arrivalTime": {"seconds": Date.parse(editedFlight.arrivalTime)/1000},
                "departureTime": {"seconds": Date.parse(editedFlight.departureTime)/1000},
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "admin": "true",
                    "authorization": "Bearer " + localStorage.getItem("token")
                },
            },
        );
        if (!response.ok) {
            throw new Error("failed")
        }

        const data = await response.json()
        onSave(editedFlight)
        toast({
            title: "Thành công",
            description: "Đã cập nhật chuyến bay thành công.",
        });
    } catch (error) {
        toast({
            title: "Lỗi",
            description: "Đã có lỗi xảy ra, vui lòng thử lại.",
            variant: "destructive",
        });
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`Chỉnh sửa thông tin chuyến bay ${editedFlight.id}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departureTime" className="text-right">
                Giờ khởi hành
              </Label>
              <Input
                id="departureTime"
                name="departureTime"
                type="datetime-local"
                // value={editedFlight.departureTime}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arrivalTime" className="text-right">
                Giờ hạ cánh
              </Label>
              <Input
                id="arrivalTime"
                name="arrivalTime"
                type="datetime-local"
                // value={editedFlight.departureTime}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}