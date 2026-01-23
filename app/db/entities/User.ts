import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({nullable: false})
  firstname: string

  @Column({nullable: false})
  lastname: string

  @Column({nullable: false})
  age: number

  @Column({ unique: true, nullable: false})
  email: string

  @Column({ unique: true, nullable: false})
  username: string

  @Column({nullable: false})
  password: string

  @BeforeInsert()
  async beforeInsert() {
    if (this.age < 12) {
      throw new Error('User must be at least 12 years old to register');
    }

    this.password = await this.hashPassword();
  }



  /**
   * Generates a hashed version of the given plain-text password.
   *
   * @param password The plain-text password to be hashed.
   * @return A promise that resolves to the hashed password.
   */
  private static async hashPassword(password: string): Promise<string> {
      return await bcrypt.hash(password, 10);
  }


  /**
   * Compares a plaintext password attempt with a hashed password to determine if they match.
   *
   * @param {string} attempt - The plaintext password input to compare.
   * @param {string} hash - The hashed password to compare against.
   * @return {Promise<boolean>} A promise that resolves to `true` if the passwords match, otherwise `false`.
   */
  private static async comparePassword(attempt: string, hash: string): Promise<boolean> {
      return await bcrypt.compare(attempt, hash);
  }
}
