import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Upload, MapPin, Users, X, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/router';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const VIETNAM_PROVINCES = [
  "An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh",
  "Bến Tre","Bình Định","Bình Dương","Bình Phước","Bình Thuận","Cà Mau",
  "Cao Bằng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp",
  "Gia Lai","Hà Giang","Hà Nam","Hà Tĩnh","Hải Dương","Hậu Giang",
  "Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu",
  "Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An",
  "Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam",
  "Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh",
  "Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang",
  "Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái",
  "Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ"
].sort();

const schema = yup.object({
  title: yup.string().required('Tên sự kiện là bắt buộc'),
  city: yup.string().required('Vui lòng chọn Tỉnh/Thành phố'),
  specificAddress: yup.string().required('Địa chỉ chi tiết là bắt buộc'),

  startDate: yup.string().required('Ngày bắt đầu là bắt buộc'),
  startTime: yup.string().required('Giờ bắt đầu là bắt buộc'),
  endDate: yup.string().required('Ngày kết thúc là bắt buộc'),
  endTime: yup.string().required('Giờ kết thúc là bắt buộc'),

  description: yup.string().nullable(),
  capacity: yup.number().typeError('Phải là số').nullable(),
});

export default function EventForm({
  initialData,
  onSubmit,
  loading = false,
  eventId = null, // Needed for thumbnail upload after event creation
}) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      city: '',
      specificAddress: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      description: '',
      capacity: '',
    },
  });

  useEffect(() => {
    if (!initialData) return;

    console.log('[EventForm] Populating form with initialData:', initialData);

    setValue('title', initialData.title || '');

    if (initialData.location) {
      const parts = initialData.location.split(', ');
      const city = parts.at(-1);

      if (VIETNAM_PROVINCES.includes(city)) {
        setValue('city', city);
        setValue('specificAddress', parts.slice(0, -1).join(', '));
      } else {
        setValue('specificAddress', initialData.location);
      }
    }

    // Parse datetime from backend (ISO format: "2025-12-23T22:05:00")
    // Backend returns startTime/endTime as ISO datetime strings
    if (initialData.startTime) {
      try {
        const startDateTime = new Date(initialData.startTime);
        if (!isNaN(startDateTime.getTime())) {
          // Format: YYYY-MM-DD for date input
          const startDateStr = startDateTime.toISOString().split('T')[0];
          // Format: HH:mm for time input
          const startTimeStr = startDateTime.toTimeString().slice(0, 5);
          setValue('startDate', startDateStr);
          setValue('startTime', startTimeStr);
          console.log('[EventForm] Parsed startDate:', startDateStr, 'startTime:', startTimeStr);
        }
      } catch (e) {
        console.error('[EventForm] Error parsing startTime:', e);
      }
    }

    if (initialData.endTime) {
      try {
        const endDateTime = new Date(initialData.endTime);
        if (!isNaN(endDateTime.getTime())) {
          const endDateStr = endDateTime.toISOString().split('T')[0];
          const endTimeStr = endDateTime.toTimeString().slice(0, 5);
          setValue('endDate', endDateStr);
          setValue('endTime', endTimeStr);
          console.log('[EventForm] Parsed endDate:', endDateStr, 'endTime:', endTimeStr);
        }
      } catch (e) {
        console.error('[EventForm] Error parsing endTime:', e);
      }
    }

    setValue('description', initialData.description || '');
    
    // Backend uses maxVolunteers, not capacity
    const capacity = initialData.maxVolunteers || initialData.capacity || initialData.volunteersNeeded || '';
    setValue('capacity', capacity);
    console.log('[EventForm] Set capacity:', capacity);

    if (initialData.image) setImagePreview(initialData.image);
    if (initialData.thumbnailUrl) setImagePreview(initialData.thumbnailUrl);
  }, [initialData, setValue]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setThumbnailFile(null);
    setImagePreview(null);
  };

  const onSubmitForm = (data) => {
    // Chuyển đổi sang format backend yêu cầu (LocalDateTime)
    // Format: YYYY-MM-DDTHH:mm:ss
    const startDateTime = `${data.startDate}T${data.startTime}:00`;
    const endDateTime = `${data.endDate}T${data.endTime}:00`;

    const formattedData = {
      title: data.title,
      description: data.description || '',
      location: `${data.specificAddress}, ${data.city}`,
      startTime: startDateTime, // Backend expects LocalDateTime as ISO string
      endTime: endDateTime,     // Backend expects LocalDateTime as ISO string
      maxVolunteers: data.capacity ? parseInt(data.capacity, 10) : null, // Backend uses maxVolunteers, not capacity
    };

    console.log('[EventForm] Formatted data for backend:', formattedData);
    onSubmit(formattedData, thumbnailFile);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">

      {/* TITLE */}
      <div>
        <label className="block text-sm font-medium mb-1">Tên sự kiện</label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input {...field} className="w-full p-2 border rounded-xl" />
          )}
        />
        <p className="text-red-500 text-xs">{errors.title?.message}</p>
      </div>

      {/* LOCATION */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Tỉnh / Thành</label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <select {...field} className="w-full p-2 border rounded-xl">
                <option value="">Chọn tỉnh</option>
                {VIETNAM_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          />
          <p className="text-red-500 text-xs">{errors.city?.message}</p>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-1 block">Địa chỉ</label>
          <Controller
            name="specificAddress"
            control={control}
            render={({ field }) => (
              <input {...field} className="w-full p-2 border rounded-xl" />
            )}
          />
          <p className="text-red-500 text-xs">{errors.specificAddress?.message}</p>
        </div>
      </div>

      {/* TIME */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Bắt đầu</label>
          <div className="flex gap-2">
            <Controller name="startDate" control={control} render={({ field }) => <input type="date" {...field} className="w-full p-2 border rounded-xl" />} />
            <Controller name="startTime" control={control} render={({ field }) => <input type="time" {...field} className="w-full p-2 border rounded-xl" />} />
          </div>
          <p className="text-red-500 text-xs">{errors.startDate?.message || errors.startTime?.message}</p>
        </div>

        <div>
          <label className="text-sm font-medium">Kết thúc</label>
          <div className="flex gap-2">
            <Controller name="endDate" control={control} render={({ field }) => <input type="date" {...field} className="w-full p-2 border rounded-xl" />} />
            <Controller name="endTime" control={control} render={({ field }) => <input type="time" {...field} className="w-full p-2 border rounded-xl" />} />
          </div>
          <p className="text-red-500 text-xs">{errors.endDate?.message || errors.endTime?.message}</p>
        </div>
      </div>

      {/* CAPACITY */}
      <div>
        <label className="text-sm font-medium">Sức chứa</label>
        <Controller
          name="capacity"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="number" {...field} className="w-full pl-10 p-2 border rounded-xl" />
            </div>
          )}
        />
      </div>

      {/* IMAGE */}
      <div>
        <label className="text-sm font-medium block mb-2">Ảnh bìa</label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img 
              src={imagePreview.startsWith('blob:') || imagePreview.startsWith('http') 
                ? imagePreview 
                : `${API_BASE_URL}${imagePreview}`} 
              className="w-48 h-32 rounded-xl object-cover border border-gray-200" 
              alt="Preview" 
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Chọn ảnh</span>
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </label>
        )}
        {thumbnailFile && (
          <p className="text-xs text-gray-500 mt-1">
            Đã chọn: {thumbnailFile.name}
          </p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium">Mô tả</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea {...field} rows={4} className="w-full p-2 border rounded-xl" />
          )}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-xl">
          Hủy
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
          {loading ? 'Đang lưu...' : 'Lưu sự kiện'}
        </button>
      </div>

    </form>
  );
}
