import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export type RegisterResult =
  | { success: true; data: "OK" }
  | { success: false; error: string };

export class UsersService {
  static async register(input: RegisterUserInput): Promise<RegisterResult> {
    // 1. Cek apakah email sudah terdaftar
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser) {
      return {
        success: false,
        error: "Email sudah terdaftar",
      };
    }

    // 2. Hash password menggunakan bcrypt native Bun
    const hashedPassword = await Bun.password.hash(input.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Simpan data user baru ke database
    await db.insert(users).values({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    return {
      success: true,
      data: "OK",
    };
  }
}
