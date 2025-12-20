import { useState, useCallback } from "react";

type FormEventLike = {
  target: {
    name: string;
    value: any;
  };
};

export const useForm = <T extends Record<string, any> = Record<string, any>>(
  initialValues: T = {} as T
) => {
  const [formData, setFormData] = useState<T>(initialValues);

  const handleInputChange = useCallback((e: FormEventLike) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as T));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const setFieldValue = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value } as T));
  }, []);

  return {
    formData,
    handleInputChange,
    resetForm,
    setFieldValue,
    setFormData,
  };
};
