import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Upload, MapPin, Users, ListChecks } from 'lucide-react';
import { useRouter } from 'next/router';

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
  requirements: yup.string().nullable(),
});

export default function EventForm({
  initialData,
  onSubmit,
  loading = false,
}) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState(null);

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
      requirements: '',
    },
  });

  useEffect(() => {
    if (!initialData) return;

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

    setValue('startDate', initialData.startDate || '');
    setValue('startTime', initialData.startTime || '');
    setValue('endDate', initialData.endDate || '');
    setValue('endTime', initialData.endTime || '');

    setValue('description', initialData.description || '');
    setValue('capacity', initialData.capacity || '');
    setValue(
      'requirements',
      Array.isArray(initialData.requirements)
        ? initialData.requirements.join('\n')
        : initialData.requirements || ''
    );

    if (initialData.image) setImagePreview(initialData.image);
  }, [initialData, setValue]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmitForm = (data) => {
    const formattedData = {
      ...data,
      location: `${data.specificAddress}, ${data.city}`,
      requirements: data.requirements
        ? data.requirements.split('\n').filter(Boolean)
        : [],
      date: `${data.startDate} ${data.startTime} - ${data.endDate} ${data.endTime}`,
    };

    delete formattedData.city;
    delete formattedData.specificAddress;

    onSubmit(formattedData);
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
        <label className="text-sm font-medium">Ảnh bìa</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" /> Upload
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </label>
        {imagePreview && <img src={imagePreview} className="w-16 h-16 mt-2 rounded object-cover" />}
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

      {/* REQUIREMENTS */}
      <div>
        <label className="text-sm font-medium">Yêu cầu</label>
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <ListChecks className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea {...field} rows={3} className="w-full pl-10 p-2 border rounded-xl" />
            </div>
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
