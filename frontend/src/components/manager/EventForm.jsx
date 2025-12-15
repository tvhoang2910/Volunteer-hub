import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Upload, Calendar, MapPin, Users, FileText, ListChecks } from 'lucide-react';
import DateTimeInput from '@/components/common/DateTimeInput';
import { useRouter } from 'next/router';

const VIETNAM_PROVINCES = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh",
    "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau",
    "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
    "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang",
    "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
    "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An",
    "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam",
    "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
    "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
    "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
    "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"
].sort();

// Schema Validation
const schema = yup.object().shape({
    title: yup.string().required('Tên sự kiện là bắt buộc'),
    city: yup.string().required('Vui lòng chọn Tỉnh/Thành phố'),
    specificAddress: yup.string().required('Địa chỉ chi tiết là bắt buộc'),
    startDate: yup.string().required('Ngày bắt đầu là bắt buộc'),
    startTime: yup.string().required('Giờ bắt đầu là bắt buộc'),
    endDate: yup.string().required('Ngày kết thúc là bắt buộc'),
    endTime: yup.string().required('Giờ kết thúc là bắt buộc'),
    capacity: yup.number().typeError('Số lượng phải là số').positive('Số lượng phải lớn hơn 0').required('Sức chứa là bắt buộc'),
    description: yup.string().required('Mô tả là bắt buộc').min(10, 'Mô tả quá ngắn'),
    requirements: yup.string().required('Yêu cầu là bắt buộc'),
});

export default function EventForm({ initialData, onSubmit, loading }) {
    const router = useRouter();
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            city: '',
            specificAddress: '',
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            capacity: 100,
            description: '',
            requirements: '',
            image: null
        }
    });

    const imagePreview = watch('imagePreview');

    useEffect(() => {
        if (initialData) {
            setValue('title', initialData.title || '');

            // Handle location split
            if (initialData.location) {
                const parts = initialData.location.split(', ');
                const potentialCity = parts[parts.length - 1];
                if (VIETNAM_PROVINCES.includes(potentialCity)) {
                    setValue('city', potentialCity);
                    setValue('specificAddress', parts.slice(0, -1).join(', '));
                } else {
                    setValue('specificAddress', initialData.location);
                }
            }

            setValue('description', initialData.description || '');
            if (initialData.timeline) {
                // Determine how timeline is stored. If string, leave as logic before if any.
                // Re-using existing logic assumption:
                setValue('startDate', initialData.startDate || '');
            }
            // Explicit check for date fields if pass separately
            if (initialData.startDate) setValue('startDate', initialData.startDate);
            if (initialData.startTime) setValue('startTime', initialData.startTime);
            if (initialData.endDate) setValue('endDate', initialData.endDate);
            if (initialData.endTime) setValue('endTime', initialData.endTime);

            if (initialData.capacity) setValue('capacity', initialData.capacity);
            if (initialData.requirements) setValue('requirements', Array.isArray(initialData.requirements) ? initialData.requirements.join('\n') : initialData.requirements);
        }
    }, [initialData, setValue]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue('image', file);
            setValue('imagePreview', URL.createObjectURL(file));
        }
    };

    const onSubmitForm = (data) => {
        const formattedLocation = `${data.specificAddress}, ${data.city}`;

        const formattedData = {
            ...data,
            location: formattedLocation,
            requirements: data.requirements.split('\n').filter(r => r.trim()),
            date: `${data.startDate} ${data.startTime} - ${data.endDate} ${data.endTime}`
        };

        // Remove temporary fields
        delete formattedData.city;
        delete formattedData.specificAddress;

        onSubmit(formattedData);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện</label>
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input {...field} className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.title ? 'border-red-500' : 'border-gray-200'}`} placeholder="Nhập tên sự kiện..." />
                        </div>
                    )}
                />
                <p className="text-red-500 text-xs mt-1">{errors.title?.message}</p>
            </div>

            {/* Location Split: City & Address */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
                    <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                <select
                                    {...field}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition appearance-none bg-white ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
                                >
                                    <option value="">Chọn Tỉnh/Thành</option>
                                    {VIETNAM_PROVINCES.map((prov) => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    />
                    <p className="text-red-500 text-xs mt-1">{errors.city?.message}</p>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                    <Controller
                        name="specificAddress"
                        control={control}
                        render={({ field }) => (
                            <input {...field} className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.specificAddress ? 'border-red-500' : 'border-gray-200'}`} placeholder="Số nhà, tên đường, phường/xã..." />
                        )}
                    />
                    <p className="text-red-500 text-xs mt-1">{errors.specificAddress?.message}</p>
                </div>
            </div>

            {/* Time */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                    <div className="flex gap-2">
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => <input type="date" {...field} className="w-full border p-2 rounded-xl" />}
                        />
                        <Controller
                            name="startTime"
                            control={control}
                            render={({ field }) => <input type="time" {...field} className="w-full border p-2 rounded-xl" />}
                        />
                    </div>
                    <p className="text-red-500 text-xs mt-1">{errors.startDate?.message || errors.startTime?.message}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                    <div className="flex gap-2">
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => <input type="date" {...field} className="w-full border p-2 rounded-xl" />}
                        />
                        <Controller
                            name="endTime"
                            control={control}
                            render={({ field }) => <input type="time" {...field} className="w-full border p-2 rounded-xl" />}
                        />
                    </div>
                    <p className="text-red-500 text-xs mt-1">{errors.endDate?.message || errors.endTime?.message}</p>
                </div>
            </div>

            {/* Capacity & Image */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (Người)</label>
                    <Controller
                        name="capacity"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                <input type="number" {...field} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border-gray-200" />
                            </div>
                        )}
                    />
                    <p className="text-red-500 text-xs mt-1">{errors.capacity?.message}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition text-gray-600">
                            <Upload className="w-4 h-4" />
                            Upload
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                        {imagePreview && <img src={imagePreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <textarea {...field} rows={4} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border-gray-200" placeholder="Mô tả nội dung sự kiện..." />
                    )}
                />
                <p className="text-red-500 text-xs mt-1">{errors.description?.message}</p>
            </div>

            {/* Requirements */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu (Mỗi dòng một yêu cầu)</label>
                <Controller
                    name="requirements"
                    control={control}
                    render={({ field }) => (
                        <div className="relative">
                            <ListChecks className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea {...field} rows={3} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border-gray-200" placeholder="- Có laptop&#10;- Tiếng Anh giao tiếp" />
                        </div>
                    )}
                />
                <p className="text-red-500 text-xs mt-1">{errors.requirements?.message}</p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition border border-transparent hover:border-gray-200 font-medium">
                    Hủy bỏ
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-200 transition flex items-center gap-2">
                    {loading ? 'Đang lưu...' : 'Lưu sự kiện'}
                </button>
            </div>
        </form>
    );
}
