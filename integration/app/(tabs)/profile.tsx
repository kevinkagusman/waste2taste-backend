import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Platform, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { BrandMark } from "@/components/BrandMark";
import { MetricPill, SectionTitle } from "@/components/Cards";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { colors, radius } from "@/data/theme";
import { supabase } from "@/lib/supabase";

// Helper konfirmasi cross-platform (Alert.alert tidak jalan di web)
function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    // Web pakai window.confirm bawaan browser
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    // Mobile pakai Alert native
    Alert.alert(title, message, [
      { text: "Batal", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: onConfirm },
    ]);
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = React.useState<string>("");
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);

  // Ambil nama lengkap user dari tabel users
  React.useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    supabase
      .from("users")
      .select("full_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.warn("Gagal ambil profil:", error.message);
          setFullName("User");
        } else {
          setFullName(data?.full_name ?? "User");
        }
        setLoadingProfile(false);
      });
  }, [user]);

  // Handler logout dengan konfirmasi cross-platform
  const handleLogout = () => {
    confirmAction("Logout", "Yakin mau keluar?", async () => {
      setLoggingOut(true);
      await signOut();
      router.replace("/login");
    });
  };

  return (
    <Screen contentStyle={{ paddingBottom: 104 }}>
      <View
        style={{
          borderRadius: radius.xl,
          borderCurve: "continuous",
          backgroundColor: colors.red,
          padding: 22,
          gap: 18,
        }}
      >
        <BrandMark compact light />
        <View style={{ gap: 4 }}>
          {loadingProfile ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <>
              <Text selectable style={{ color: colors.cream, fontSize: 24, fontWeight: "900" }}>
                {fullName}
              </Text>
              <Text selectable style={{ color: "rgba(255,220,157,0.78)", fontSize: 13 }}>
                {user?.email ?? "Home cook • Waste saver"}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <MetricPill label="weekly saves" value="5" />
        <MetricPill label="favorite" value="Rice" />
      </View>

      <SectionTitle title="Preferences" />
      <View style={{ gap: 10 }}>
        {["Vegetable-first recipes", "Quick meals under 30 min", "Indonesian comfort flavors"].map((item) => (
          <View
            key={item}
            style={{
              borderRadius: radius.md,
              borderCurve: "continuous",
              backgroundColor: colors.paper,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text selectable style={{ color: colors.ink, fontSize: 14, fontWeight: "800" }}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      <AppButton label="Edit Profile" variant="ghost" onPress={() => undefined} />

      {/* Tombol Logout - bagian baru */}
      <View style={{ marginTop: 8 }}>
        <AppButton
          label={loggingOut ? "Logging out..." : "Logout"}
          variant="red"
          onPress={handleLogout}
          disabled={loggingOut}
        />
      </View>
    </Screen>
  );
}
