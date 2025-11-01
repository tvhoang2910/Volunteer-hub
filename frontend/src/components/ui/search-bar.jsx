import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { CiSearch } from 'react-icons/ci';
import { MdClear } from 'react-icons/md';
import Box from '@mui/material/Box';

const SearchBar = ({
    className,
    placeholder = "Tìm kiếm sự kiện...",
    value,
    onChange,
    onSearch,
    allowClear = true,
    size = "middle",
}) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(e.target.value);
        }
    };

    const handleClear = () => {
        if (onChange) {
            onChange({ target: { value: '' } });
        }
        if (onSearch) {
            onSearch('');
        }
    };

    // Map size prop to MUI size
    const muiSize = size === "large" ? "medium" : size === "small" ? "small" : "medium";

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