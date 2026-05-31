import { Link, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { BrandMark } from "@/components/BrandMark";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { colors, radius, shadow } from "@/data/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Eitss", "Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert("Login Gagal", error);
      return;
    }
    router.replace("/home");
  };

  return (
    <Screen backgroundColor={colors.red} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, gap: 0 }}>
      <View style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 26 }}>
        <BrandMark compact light />
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.yellow,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          borderCurve: "continuous",
          padding: 24,
          gap: 16,
        }}
      >
        <Text selectable style={{ color: colors.green, fontSize: 38, fontWeight: "900" }}>
          Login
        </Text>
        <AuthInput
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <AuthInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text selectable style={{ alignSelf: "flex-end", color: colors.green, fontSize: 12, fontWeight: "700" }}>
          Forgot Password?
        </Text>
        <AppButton
          label={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />
        {loading && <ActivityIndicator color={colors.green} />}

        <Text selectable style={{ color: colors.red, textAlign: "center", fontSize: 12 }}>
          Or login with
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {["f", "G", "A"].map((label) => (
            <View
              key={label}
              style={{
                flex: 1,
                height: 54,
                borderRadius: radius.md,
                borderCurve: "continuous",
                backgroundColor: colors.white,
                alignItems: "center",
                justifyContent: "center",
                ...shadow,
              }}
            >
              <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "900" }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
        <Text selectable style={{ color: colors.red, textAlign: "center", marginTop: 6 }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: colors.green, fontWeight: "900" }}>
            Sign Up
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

function AuthInput({
  placeholder,
  secureTextEntry,
  keyboardType,
  value,
  onChangeText,
  autoCapitalize,
}: {
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "email-address" | "default";
  value: string;
  onChangeText: (text: string) => void;
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <TextInput
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize ?? "sentences"}
      placeholderTextColor="#B38B63"
      style={{
        minHeight: 54,
        borderRadius: 28,
        backgroundColor: colors.white,
        paddingHorizontal: 18,
        fontSize: 15,
        color: colors.ink,
      }}
    />
  );
}
