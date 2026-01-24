import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate } from "typeorm"
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number | null = null

  @Column({ type: 'varchar', nullable: false })
  firstname: string = ''

  @Column({ type: 'varchar', nullable: false })
  lastname: string = ''

  @Column({ type: 'int', nullable: false })
  age: number = 0

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string = ''

  @Column({ type: 'varchar', unique: true, nullable: false })
  username: string = ''

  @Column({ type: 'varchar', nullable: false })
  password: string = ''

  @CreateDateColumn()
  createdAt: Date | null = null

  @UpdateDateColumn()
  updatedAt: Date | null = null

  @DeleteDateColumn()
  deletedAt: Date | null = null

  // Internal property to track original password for change detection
  originalPassword?: string

  @BeforeInsert()
  async beforeInsert() {
    if (this.age < 12) {
      throw new Error('User must be at least 12 years old to register');
    }

    this.password = await this.hashPassword();
  }

  @BeforeUpdate()
  async beforeUpdate() {
      if ( this.age < 12 ) {
          throw new Error('User must be at least 12 years old to register');
      }
      if (this.password !== this.originalPassword) {
          this.password = await this.hashPassword();
      }
  }


  /**
   * Generates a hashed version of the given plain-text password.
   *
   * @param password The plain-text password to be hashed.
   * @return A promise that resolves to the hashed password.
   */
  private async hashPassword(): Promise<string> {
      return await bcrypt.hash(this.password, 10);
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
