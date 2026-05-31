import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/data/theme";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Eitss", "Email, password, dan nama wajib diisi");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password terlalu pendek", "Minimal 8 karakter");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password tidak cocok", "Pastikan kedua password sama");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);

    if (error) {
      Alert.alert("Registrasi Gagal", error);
      return;
    }
    Alert.alert("Berhasil!", "Akun kamu berhasil dibuat.");
    router.replace("/home");
  };

  return (
    <Screen backgroundColor={colors.red} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, gap: 0 }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 }}>
        <AppButton
          label="Back to login"
          variant="ghost"
          onPress={() => router.back()}
          style={{ alignSelf: "flex-start", minHeight: 38 }}
        />
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.yellow,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          borderCurve: "continuous",
          padding: 24,
          gap: 14,
        }}
      >
        <Text selectable style={{ color: colors.green, fontSize: 38, fontWeight: "900" }}>
          Sign Up
        </Text>

        <SignupInput
          placeholder="Nama Lengkap"
          value={fullName}
          onChangeText={setFullName}
        />
        <SignupInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <SignupInput
          placeholder="Password (min. 8 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <SignupInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Text selectable style={{ color: colors.green, fontSize: 13, lineHeight: 19 }}>
          By continuing, you agree with Waste2Taste&apos;s privacy policy.
        </Text>
        <AppButton
          label={loading ? "Creating account..." : "Create Account"}
          onPress={handleSignup}
          disabled={loading}
        />
        {loading && <ActivityIndicator color={colors.green} />}

        <Text selectable style={{ color: colors.red, textAlign: "center" }}>
          Already have an account?{" "}
          <Text onPress={() => router.back()} style={{ color: colors.green, fontWeight: "900" }}>
            Sign In
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

function SignupInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "email-address" | "phone-pad" | "default";
  autoCapitalize?: "none" | "sentences" | "words";
}) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
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
