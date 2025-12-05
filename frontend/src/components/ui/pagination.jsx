import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

export default function BasicPagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const handleChange = (_, value) => {
    if (value < 1 || value > totalPages) return;
    onPageChange?.(value);
  };

  return (
    <Stack spacing={2}>
      <Pagination
        count={Math.max(totalPages, 1)}
        page={currentPage}
        onChange={handleChange}
        color="primary"
      />
    </Stack>
  );
}
