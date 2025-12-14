import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Upload, Calendar, MapPin, Users, FileText, ListChecks } from 'lucide-react';
import DateTimeInput from '@/components/common/DateTimeInput'; // Assuming this exists/compatible
import { useRouter } from 'next/router';

// Schema Validation
const schema = yup.object().shape({
    title: yup.string().required('Tên sự kiện là bắt buộc'),
    location: yup.string().required('Địa điểm là bắt buộc'),
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
            location: '',
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
            // Map initialData to form fields
            // Assuming initialData has similar keys or we map them here
            setValue('title', initialData.title || '');
            setValue('location', initialData.location || '');
            setValue('description', initialData.description || '');
            // Date splitting logic if needed
            if (initialData.timeline) {
                // Assuming timeline object structure or string
                // This depends on how data is passed. 
                // For now, let's assume basic fields mapping
                setValue('startDate', initialData.startDate || '');
                // ...
            }
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
        // Process data to match API expectation
        // requirements from string to array if needed
        const formattedData = {
            ...data,
            requirements: data.requirements.split('\n').filter(r => r.trim()),
            date: `${data.startDate} ${data.startTime} - ${data.endDate} ${data.endTime}` // Format for existing logic if any
        };
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

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input {...field} className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.location ? 'border-red-500' : 'border-gray-200'}`} placeholder="Địa điểm tổ chức..." />
                        </div>
                    )}
                />
                <p className="text-red-500 text-xs mt-1">{errors.location?.message}</p>
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
