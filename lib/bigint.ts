const BASE = BigInt("10000");
const ZERO = BigInt("0");
const ONE = BigInt("1");
const TWO = BigInt("2");

/**
 * 解析 L 分隔的字符串为 BigInt
 * 示例: "1L2L3L" → 1 + 2*10000 + 3*10000^2
 */
export function parseBigIntArray(str: string): bigint {
    if (!str) throw new Error("Empty input");
    const parts = str.split('L').filter(Boolean);
    if (parts.length === 0) return ZERO;
    let result = ZERO;
    let power = ONE;
    for (const part of parts) {
        const digit = BigInt(part.trim());
        result = result + digit * power;
        power = power * BASE;
    }
    return result;
}

/**
 * 将 BigInt 转为 base 10000 数组（低位在前）
 * 示例: 100050006 → [6, 5, 1]
 */
export function bigIntToDigits(num: bigint): number[] {
    if (num === ZERO) return [0];
    const digits: number[] = [];
    let n = num;
    while (n > ZERO) {
        const digit = Number(n % BASE);
        digits.push(digit);
        n = n / BASE;
    }
    return digits;
}

/**
 * 将数字数组格式化为 L 分隔字符串（用于 URL）
 * 示例: [6, 5, 1] → "6L5L1L"
 */
export function formatToLFormat(arr: number[]): string {
    return arr.join('L') + 'L';
}

/**
 * 将数字数组格式化为 [1,2,3] 格式（用于输出）
 * 示例: [6, 5, 1] → "[6,5,1]"
 */
export function formatEncrypted(arr: number[]): string {
    return `[${arr.join(',')}]`;
}

/**
 * 快速模幂：base^exp mod mod
 * 使用纯字符串构造的 BigInt，无 n 字面量
 */
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    if (mod === ONE) return ZERO;
    let result = ONE;
    let b = base % mod;
    let e = exp;
    while (e > ZERO) {
        if (e % TWO === ONE) {
            result = (result * b) % mod;
        }
        b = (b * b) % mod;
        e = e / TWO;
    }
    return result;
}