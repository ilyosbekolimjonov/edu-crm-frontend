import { Stack, TextField } from "@mui/material";

const digitsFromValue = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.startsWith("998") ? digits.slice(3, 12) : digits.slice(0, 9);
};

export default function PhoneInput({ value, onChange, label = "Telefon", required = false, disabled = false }) {
    const digits = digitsFromValue(value);

    const handleChange = (event) => {
        const nextDigits = event.target.value.replace(/\D/g, "").slice(0, 9);
        onChange?.(`+998${nextDigits}`);
    };

    return (
        <Stack direction="row" spacing={1}>
            <TextField
                label="Kod"
                value="+998"
                disabled
                sx={{ width: 96, flexShrink: 0 }}
            />
            <TextField
                label={label}
                value={digits}
                onChange={handleChange}
                required={required}
                disabled={disabled}
                fullWidth
                placeholder="901234567"
                slotProps={{
                    htmlInput: {
                        inputMode: "numeric",
                        maxLength: 9,
                        pattern: "\\d{9}",
                    },
                }}
                helperText="9 ta raqam kiriting"
            />
        </Stack>
    );
}
