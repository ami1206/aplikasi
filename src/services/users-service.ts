import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export type RegisterResult =
  | { success: true; data: "OK" }
  | { success: false; error: string };

export interface LoginUserInput {
  email: string;
  password: string;
}

export type LoginResult =
  | { success: true; data: string }
  | { success: false; error: string };

export interface CurrentUserOutput {
  id: number;
  name: string;
  email: string;
  created_at: string | Date;
}

export type CurrentUserResult =
  | { success: true; data: CurrentUserOutput }
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

  static async login(input: LoginUserInput): Promise<LoginResult> {
    // 1. Cari user berdasarkan email
    const [user] = await db
      .select({
        id: users.id,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "Email atau password salah",
      };
    }

    // 2. Verifikasi password hash bcrypt
    const isPasswordValid = await Bun.password.verify(input.password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email atau password salah",
      };
    }

    // 3. Generate token UUID
    const token = crypto.randomUUID();

    // 4. Simpan session baru ke database
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return {
      success: true,
      data: token,
    };
  }

  static async getCurrentUser(token: string): Promise<CurrentUserResult> {
    // Cari user berdasarkan session token
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return {
      success: true,
      data: user,
    };
  }
}
