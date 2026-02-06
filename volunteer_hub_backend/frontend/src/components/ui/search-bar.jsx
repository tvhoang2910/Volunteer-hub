import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { CiSearch } from 'react-icons/ci';
import { MdClear } from 'react-icons/md';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const SearchBar = ({
    className,
    placeholder = "Tìm kiếm sự kiện...",
    value,
    onChange,
    onSearch,
    allowClear = true,
    size = "middle",
    useAutocomplete = true,
    apiEndpoint = "/api/search/autocomplete/events", // Default to events autocomplete
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef(null);

    // Fetch autocomplete suggestions
    useEffect(() => {
        if (!useAutocomplete || !value || value.trim().length === 0) {
            setSuggestions([]);
            return;
        }

        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);

        const fetchSuggestions = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}${apiEndpoint}`, {
                    params: {
                        keyword: value.trim(),
                        limit: 10,
                    },
                    signal: abortControllerRef.current.signal,
                });

                // Handle different response structures
                let data = response.data;
                if (data.data) {
                    data = data.data; // If wrapped in ResponseDTO
                }
                
                // Map API response to autocomplete format
                const items = Array.isArray(data) ? data : [];
                setSuggestions(items.map(item => ({
                    id: item.eventId || item.postId || item.userId,
                    title: item.title || item.content || item.name,
                    originalItem: item,
                })));
            } catch (error) {
                if (error.name !== 'CanceledError') {
                    console.error('Error fetching suggestions:', error);
                    setSuggestions([]);
                }
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300); // Debounce API calls
        return () => clearTimeout(timer);
    }, [value, useAutocomplete, apiEndpoint]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(e.target.value);
        }
    };

    const handleClear = () => {
        if (onChange) {
            onChange({ target: { value: '' } });
        }
        setSuggestions([]);
        if (onSearch) {
            onSearch('');
        }
    };

    const handleSelectSuggestion = (selectedItem) => {
        if (onChange && selectedItem) {
            onChange({ target: { value: selectedItem.title } });
        }
        if (onSearch) {
            onSearch(selectedItem.title);
        }
    };

    // Map size prop to MUI size
    const muiSize = size === "large" ? "medium" : size === "small" ? "small" : "medium";

    if (useAutocomplete) {
        return (
            <Autocomplete
                freeSolo
                options={suggestions}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.title || '';
                }}
                inputValue={value || ''}
                onInputChange={(event, newValue) => {
                    if (onChange) {
                        onChange({ target: { value: newValue } });
                    }
                }}
                onChange={(event, newValue) => {
                    if (newValue && typeof newValue === 'object') {
                        handleSelectSuggestion(newValue);
                    }
                }}
                loading={loading}
                noOptionsText="Không tìm thấy sự kiện nào"
                loadingText="Đang tìm kiếm..."
                className={className}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        variant="outlined"
                        size={muiSize}
                        onKeyPress={handleKeyPress}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    {allowClear && value && (
                                        <IconButton
                                            onClick={handleClear}
                                            edge="end"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <MdClear />
                                        </IconButton>
                                    )}
                                    {onSearch && (
                                        <IconButton
                                            onClick={() => onSearch(value)}
                                            edge="end"
                                            size="small"
                                        >
                                            <CiSearch />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                },
                            },
                        }}
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props}>
                        <div className="w-full">
                            <p className="font-medium text-sm">{option.title}</p>
                        </div>
                    </li>
                )}
            />
        );
    }

    // Non-autocomplete version (original behavior)
    return (
        <Box className={className}>
            <TextField
                fullWidth
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                size={muiSize}
                variant="outlined"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {allowClear && value && (
                                <IconButton
                                    onClick={handleClear}
                                    edge="end"
                                    size="small"
                                    sx={{ mr: 1 }}
                                >
                                    <MdClear />
                                </IconButton>
                            )}
                            {onSearch && (
                                <IconButton
                                    onClick={() => onSearch(value)}
                                    edge="end"
                                    size="small"
                                >
                                    <CiSearch />
                                </IconButton>
                            )}
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                    },
                }}
            />
        </Box>
    );
};

export default SearchBar;