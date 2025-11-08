import { useState, useEffect } from "react";
import DateTimeInput from "@/components/common/DateTimeInput";
import Alert from "@/components/ui/SimpleAlert";

const emptyEvent = {
  name: "",
  location: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  description: "",
  image: null,
  imagePreview: null,
};

const parseDateRange = (range) => {
  if (!range || typeof range !== "string") return ["", ""];
  const [start, end] = range.split(" - ").map((value) => value?.trim() || "");
  return [start, end];
};

export default function CreateEventModal({ onClose, onSave, initialData = null }) {
  const [eventData, setEventData] = useState(emptyEvent);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (initialData) {
      const [parsedStartDate, parsedEndDate] = parseDateRange(initialData.date);
      setEventData({
        name: initialData.title || "",
        location: initialData.location || "",
        startDate: initialData.startDate || parsedStartDate,
        startTime: initialData.startTime || "",
        endDate: initialData.endDate || parsedEndDate,
        endTime: initialData.endTime || "",
        description: initialData.description || "",
        image: null,
        imagePreview: initialData.img || initialData.imagePreview || null,
      });
    } else {
      setEventData(emptyEvent);
    }
  }, [initialData]);

  useEffect(
    () => () => {
      if (eventData.imagePreview && eventData.image instanceof File) {
        try {
          URL.revokeObjectURL(eventData.imagePreview);
        } catch {
          /* ignore */
        }
      }
    },
    [eventData.image, eventData.imagePreview]
  );

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEventData((prev) => {
      if (prev.imagePreview && prev.image instanceof File) {
        try {
          URL.revokeObjectURL(prev.imagePreview);
        } catch {
          /* ignore */
        }
      }
      return {
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      };
    });
  };

  const handleDateTimeChange = (field, value, isStart) => {
    setEventData((prev) => ({
      ...prev,
      [isStart
        ? field === "date"
          ? "startDate"
          : "startTime"
        : field === "date"
        ? "endDate"
        : "endTime"]: value,
    }));
  };

  const validateData = () => {
    const {
      name,
      location,
      startDate,
      startTime,
      endDate,
      endTime,
      description,
      image,
      imagePreview,
    } = eventData;

    if (
      !name ||
      !location ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      !description ||
      (!image && !imagePreview)
    ) {
      setAlert({
        type: "error",
        message: "⚠️ Vui lòng nhập đầy đủ thông tin và tải ảnh mô tả sự kiện!",
      });
      return false;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (Number.isNaN(start) || Number.isNaN(end)) {
      setAlert({
        type: "error",
        message: "⚠️ Dữ liệu ngày hoặc giờ không hợp lệ!",
      });
      return false;
    }

    if (end < start) {
      setAlert({
        type: "error",
        message:
          startDate === endDate
            ? "⚠️ Giờ kết thúc phải sau giờ bắt đầu nếu cùng ngày!"
            : "⚠️ Ngày kết thúc không thể trước ngày bắt đầu!",
      });
      return false;
    }

    if (startDate === endDate && startTime >= endTime) {
      setAlert({
        type: "error",
        message: "⚠️ Giờ kết thúc phải sau giờ bắt đầu nếu cùng ngày!",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateData()) return;

    const newEvent = {
      title: eventData.name,
      location: eventData.location,
      date: `${eventData.startDate} - ${eventData.endDate}`,
      img: eventData.imagePreview,
      description: eventData.description,
      status: initialData?.status || "pending",
    };

    onSave(newEvent);

    setAlert({
      type: "success",
      message: initialData
        ? "🎉 Sự kiện đã được cập nhật!"
        : "🎉 Sự kiện đã được tạo thành công!",
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const heading = initialData ? "✏️ Chỉnh sửa sự kiện" : "🌿 Tạo sự kiện mới";
  const actionLabel = initialData ? "Cập nhật sự kiện" : "Lưu sự kiện";

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-[#E8F5F3] rounded-xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] border border-[#A7E3D8]">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#084C61]">
            {heading}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 text-[#084C61]">
            <div>
              <label className="block font-medium mb-1">Tên sự kiện</label>
              <input
                type="text"
                value={eventData.name}
                onChange={(e) =>
                  setEventData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nhập tên sự kiện..."
                className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Địa điểm</label>
              <input
                type="text"
                value={eventData.location}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Ví dụ: Hà Nội, Việt Nam"
                className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Thời gian sự kiện</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimeInput
                  label="Ngày bắt đầu"
                  dateValue={eventData.startDate}
                  timeValue={eventData.startTime}
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, true)
                  }
                />
                <DateTimeInput
                  label="Ngày kết thúc"
                  dateValue={eventData.endDate}
                  timeValue={eventData.endTime}
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, false)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Ảnh mô tả sự kiện</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border border-[#6FCF97] rounded-md px-3 py-2 w-full text-sm cursor-pointer bg-white"
              />
              {eventData.imagePreview && (
                <div className="mt-3">
                  <img
                    src={eventData.imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md border border-[#6FCF97]"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">
                Mô tả chi tiết sự kiện
              </label>
              <textarea
                value={eventData.description}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Nhập mô tả chi tiết về sự kiện..."
                className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-[#2F80ED] hover:bg-[#56CCF2] text-white font-semibold transition"
              >
                {actionLabel}
              </button>
            </div>
          </form>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}
