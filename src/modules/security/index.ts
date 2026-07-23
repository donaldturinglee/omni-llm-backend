import { randomInt } from 'node:crypto';
import argon2 from 'argon2';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SPECIAL = '!@#$%^&*()~_';

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 65536,
    parallelism: 4,
    hashLength: 32,
    saltLength: 16,
} as const;

const choice = (alphabet: string): string => alphabet[randomInt(alphabet.length)] as string;

const shuffle = <T>(items: T[]): T[] => {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const target = randomInt(index + 1);
        [items[index], items[target]] = [items[target] as T, items[index] as T];
    }
    return items;
};

export const getPasswordHash = async (password: string): Promise<string> => {
    return argon2.hash(password, ARGON2_OPTIONS);
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await argon2.verify(hashedPassword, plainPassword);
    } catch {
        return false;
    }
};

export const generatePassword = (length = 24): string => {
    const alphabet = LOWERCASE + UPPERCASE + DIGITS + SPECIAL;

    const password = [
        choice(LOWERCASE),
        choice(UPPERCASE),
        choice(DIGITS),
        choice(SPECIAL),
    ];

    for (let index = 0; index < length - 4; index += 1) {
        password.push(choice(alphabet));
    }

    return shuffle(password).join('');
};

export const generateAPIKey = (prefix: string, length = 48): string => {
    const alphabet = DIGITS + LOWERCASE + UPPERCASE;
    let key = '';

    for (let index = 0; index < length; index += 1) {
        key += choice(alphabet);
    }

    return `${prefix}${key}`;
};

export const generateVerificationCode = (length = 6): string => {
    let code = '';

    for (let index = 0; index < length; index += 1) {
        code += choice(DIGITS);
    }

    return code;
};
