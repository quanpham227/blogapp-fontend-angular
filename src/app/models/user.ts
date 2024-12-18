export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullName: string; // Khớp với @JsonProperty("fullname")
  email: string;
  phoneNumber: string; // Khớp với @JsonProperty("phone_number")
  profileImage: string | null; // Khớp với @JsonProperty("profile_image")
  isActive: boolean; // Khớp với @JsonProperty("is_active")
  facebookAccountId: string; // Khớp với @JsonProperty("facebook_account_id")
  googleAccountId: string; // Khớp với @JsonProperty("google_account_id")
  role: Role; // Khớp với @JsonProperty("role")
}
