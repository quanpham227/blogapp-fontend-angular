export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullname: string; // Khớp với @JsonProperty("fullname")
  email: string;
  phone_number: string; // Khớp với @JsonProperty("phone_number")
  profile_image: string | null; // Khớp với @JsonProperty("profile_image")
  is_active: boolean; // Khớp với @JsonProperty("is_active")
  facebook_account_id: string; // Khớp với @JsonProperty("facebook_account_id")
  google_account_id: string; // Khớp với @JsonProperty("google_account_id")
  role: Role; // Khớp với @JsonProperty("role")
}
