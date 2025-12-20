import { useState, useCallback } from "react";

export const useForm = (initialValues = {}) => {
    const [formData, setFormData] = useState(initialValues);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialValues);
    }, [initialValues]);

    const setFieldValue = useCallback((name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    return {
        formData,
        handleInputChange,
        resetForm,
        setFieldValue,
        setFormData,
    };
};
