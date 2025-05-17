import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";

const schema = z.object({
  username: z.string().min(3, "Username too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof schema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await fetch(
        "https://extra-brooke-yeremiadio-46b2183e.koyeb.app/api/auth/local/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      if (result.jwt) {
        localStorage.setItem("token", result.jwt);
        navigate("/");
      } else {
        alert(result?.error?.message || "Register failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            {...register("username")}
            placeholder="Username"
            className="w-full border px-3 py-2 rounded"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            {...register("email")}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
