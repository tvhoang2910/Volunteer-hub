"use client";

import { useState, useEffect } from "react";
import DateTimeInput from "@/components/common/DateTimeInput";
import Alert from "@/components/ui/SimpleAlert";

const provinces = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Ninh",
  "Bình Dương",
  "Bình Định",
  "Bình Thuận",
  "Đắk Lắk",
  "Đắk Nông",
  "Đồng Nai",
  "Gia Lai",
  "Huế",
  "Khánh Hòa",
  "Lâm Đồng",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Nam",
  "Quảng Ninh",
  "Quảng Trị",
  "Thanh Hóa",
  "Tiền Giang",
  "Vĩnh Phúc",
];

const emptyEvent = {
  name: "",
  province: "",
  address: "",
  registerStartDate: "",
  registerStartTime: "",
  registerEndDate: "",
  registerEndTime: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  volunteerCount: "",
  description: "",
  mission: "",
  requirements: "",
  image: null,
  imagePreview: null,
};

const parseDateRange = (range) => {
  if (!range || typeof range !== "string") return ["", ""];
  const [start, end] = range.split(" - ").map((value) => value?.trim() || "");
  return [start, end];
};

export default function CreateEventModal({
  onClose,
  onSave,
  initialData = null,
}) {
  const [eventData, setEventData] = useState(emptyEvent);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (initialData) {
      const [parsedStartDate, parsedEndDate] = parseDateRange(initialData.date);
      setEventData({
        name: initialData.title || "",
        province: initialData.location || "",
        address: initialData.address || "",
        registerStartDate: initialData.registerStartDate || "",
        registerStartTime: initialData.registerStartTime || "",
        registerEndDate: initialData.registerEndDate || "",
        registerEndTime: initialData.registerEndTime || "",
        startDate: initialData.startDate || parsedStartDate,
        startTime: initialData.startTime || "",
        endDate: initialData.endDate || parsedEndDate,
        endTime: initialData.endTime || "",
        volunteerCount:
          initialData.volunteerCount ||
          initialData.volunteersNeeded ||
          "",
        description: initialData.description || "",
        mission: initialData.mission || "",
        requirements: Array.isArray(initialData.requirements)
          ? initialData.requirements.join("\n")
          : initialData.requirements || "",
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

  const handleDateTimeChange = (field, value, keyPrefix) => {
    const dateKey = `${keyPrefix}Date`;
    const timeKey = `${keyPrefix}Time`;
    setEventData((prev) => ({
      ...prev,
      [field === "date" ? dateKey : timeKey]: value,
    }));
  };

  const validateData = () => {
    const {
      name,
      province,
      address,
      registerStartDate,
      registerStartTime,
      registerEndDate,
      registerEndTime,
      startDate,
      startTime,
      endDate,
      endTime,
      volunteerCount,
      description,
      mission,
      requirements,
      image,
      imagePreview,
    } = eventData;

    if (
      !name ||
      !province ||
      !address ||
      !registerStartDate ||
      !registerStartTime ||
      !registerEndDate ||
      !registerEndTime ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      !volunteerCount ||
      !description ||
      !mission ||
      !requirements ||
      (!image && !imagePreview)
    ) {
      setAlert({
        type: "error",
        message: "Vui lòng nhập đầy đủ trường bắt buộc và tải ảnh sự kiện.",
      });
      return false;
    }

    const registerStart = new Date(`${registerStartDate}T${registerStartTime}`);
    const registerEnd = new Date(`${registerEndDate}T${registerEndTime}`);
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      Number.isNaN(registerStart) ||
      Number.isNaN(registerEnd)
    ) {
      setAlert({
        type: "error",
        message: "Dữ liệu ngày/giờ không hợp lệ.",
      });
      return false;
    }

    if (registerEnd < registerStart) {
      setAlert({
        type: "error",
        message:
          "Thời gian kết thúc đăng ký phải sau thời gian bắt đầu đăng ký.",
      });
      return false;
    }

    if (end < start) {
      setAlert({
        type: "error",
        message: "Thời gian diễn ra phải sau thời gian đăng ký.",
      });
      return false;
    }

    if (startDate === endDate && startTime >= endTime) {
      setAlert({
        type: "error",
        message:
          "Giờ kết thúc phải sau giờ bắt đầu nếu trong cùng một ngày.",
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
      location: eventData.province,
      address: eventData.address,
      registerStartDate: eventData.registerStartDate,
      registerStartTime: eventData.registerStartTime,
      registerEndDate: eventData.registerEndDate,
      registerEndTime: eventData.registerEndTime,
      date: `${eventData.startDate} - ${eventData.endDate}`,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      volunteersNeeded: Number(eventData.volunteerCount) || 0,
      mission: eventData.mission,
      requirements: eventData.requirements
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      img: eventData.imagePreview,
      description: eventData.description,
      status: initialData?.status || "pending",
    };

    onSave(newEvent);

    setAlert({
      type: "success",
      message: initialData
        ? "Sự kiện đã được cập nhật!"
        : "Sự kiện đã được tạo thành công! Đang chờ duyệt.",
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const heading = initialData ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới";
  const actionLabel = initialData ? "Cập nhật sự kiện" : "Lưu sự kiện";

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-[#E8F5F3] rounded-xl shadow-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh] border border-[#A7E3D8]">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#084C61]">
            {heading}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 text-[#084C61]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
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
                <label className="block font-medium mb-1">Tỉnh/Thành phố</label>
                <select
                  value={eventData.province}
                  onChange={(e) =>
                    setEventData((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                  className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
                >
                  <option value="">Chọn tỉnh/TP</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  value={eventData.address}
                  onChange={(e) =>
                    setEventData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Số nhà, đường, phường/xã..."
                  className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
                />
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3">Thời gian đăng ký</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimeInput
                  label="Bắt đầu"
                  dateValue={eventData.registerStartDate}
                  timeValue={eventData.registerStartTime}
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, "registerStart")
                  }
                />
                <DateTimeInput
                  label="Kết thúc"
                  dateValue={eventData.registerEndDate}
                  timeValue={eventData.registerEndTime}
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, "registerEnd")
                  }
                />
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3">Thời gian diễn ra</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimeInput
                  label="Bắt đầu"
                  dateValue={eventData.startDate}
                  timeValue={eventData.startTime}
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, "start")
                  }
                />
                <DateTimeInput
                  label="Kết thúc"
                  dateValue={eventData.endDate}
                  timeValue={eventData.endTime}
                  onChange={(field, value) =>
                    handleDateTimeChange(field, value, "end")
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block font-medium mb-1">
                  Số lượng tình nguyện viên
                </label>
                <input
                  type="number"
                  min="1"
                  value={eventData.volunteerCount}
                  onChange={(e) =>
                    setEventData((prev) => ({
                      ...prev,
                      volunteerCount: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: 50"
                  className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Ảnh sự kiện</label>
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
                      className="w-full h-40 object-cover rounded-md border border-[#6FCF97]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="Nhập mô tả chi tiết..."
                  className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Nhiệm vụ</label>
                <textarea
                  value={eventData.mission}
                  onChange={(e) =>
                    setEventData((prev) => ({
                      ...prev,
                      mission: e.target.value,
                    }))
                  }
                  placeholder="Mô tả nhiệm vụ chính..."
                  className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
                  rows={4}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Yêu cầu khi tham gia
              </label>
              <textarea
                value={eventData.requirements}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    requirements: e.target.value,
                  }))
                }
                placeholder="Mỗi dòng một yêu cầu (nhấn Enter xuống dòng)..."
                className="w-full border border-[#6FCF97] bg-white px-3 py-2 rounded-md focus:ring-2 focus:ring-[#6FCF97] outline-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Huỷ
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
