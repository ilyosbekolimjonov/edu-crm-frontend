import { useState } from "react";
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginRequest } from "../services/auth.service";
import useAuthStore from "../store/auth.store";
import { getDashboardPath } from "../utils/getDashboardPath";
import loginIllustration from "../assets/login-bro.svg";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            login: "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        try {
            const data = await loginRequest(values);

            const decoded = jwtDecode(data.accessToken);
            const role = decoded.role;

            setAuth({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                role,
            });

            toast.success("Muvaffaqiyatli kirildi");

            setTimeout(() => {
                navigate(getDashboardPath(role), { replace: true });
            }, 700);
        } catch (error) {
            const message =
                error?.response?.data?.message || "Login yoki parol noto‘g‘ri";

            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const onInvalid = () => {
        toast.error("Login va parolni to'ldiring");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                backgroundColor: "#efefef",
            }}
        >
            <Box
                sx={{
                    display: { xs: "none", lg: "flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#eceae4",
                    borderRight: "1px solid #e3e0d9",
                    p: 4,
                }}
            >
                <Box
                    component="img"
                    src={loginIllustration}
                    alt="Login illustration"
                    sx={{
                        width: "100%",
                        maxWidth: 520,
                        objectFit: "contain",
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 3, sm: 5 },
                }}
            >
                <Box sx={{ width: "100%", maxWidth: 420 }}>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#2f2a24", mb: 5 }}
                    >
                        Kirish
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit, onInvalid)}
                        sx={{ display: "grid", gap: 3 }}
                    >
                        <TextField
                            fullWidth
                            label="Email / Username"
                            variant="outlined"
                            {...register("login", {
                                required: "Login majburiy",
                            })}
                            error={!!errors.login}
                            helperText={errors.login?.message || "Masalan: aliyev"}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#f5f5f5",
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Parol"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            {...register("password", {
                                required: "Parol majburiy",
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#f5f5f5",
                                },
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                height: 44,
                                borderRadius: "8px",
                                textTransform: "none",
                                fontSize: "20px",
                                fontWeight: 500,
                                backgroundColor: "#b7864f",
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: "#a2733f",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            {isSubmitting ? "Kirilmoqda..." : "Kirish"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}