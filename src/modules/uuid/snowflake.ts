/**
 * Unique ID generation algorithms.
 *
 * This module provides various unique ID generation implementations:
 * - Snowflake: Twitter's distributed unique ID generator
 */

/**
 * Snowflake start epochs.
 */
export const Epoch = {
    Unix: 0n,
    Twitter: 1288834974657n,
    Discord: 1420070400000n,
    // Oct 24, 2024, 00:00:00 UTC
    OmniLLM: 1729728000000n,
};

const DEFAULT_VALUE = 0n;
const DEFAULT_SEQUENCE = DEFAULT_VALUE;

const UNSIGNED_INCREASE = 1n;
const SIGNED_INCREASE = -1n;

// Bit lengths
const DATA_CENTER_ID_BITS = 5n;
const MACHINE_ID_BITS = 5n;
const SEQUENCE_BITS = 12n;

// Bit shifts
const MACHINE_ID_SHIFT = SEQUENCE_BITS; // 12
const DATA_CENTER_ID_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS; // 17
const TIMESTAMP_SHIFT = SEQUENCE_BITS + MACHINE_ID_BITS + DATA_CENTER_ID_BITS; // 22

// Masks
const DATA_CENTER_ID_MASK = SIGNED_INCREASE ^ (SIGNED_INCREASE << DATA_CENTER_ID_BITS);
const MACHINE_ID_MASK = SIGNED_INCREASE ^ (SIGNED_INCREASE << MACHINE_ID_BITS);
const SEQUENCE_MASK = SIGNED_INCREASE ^ (SIGNED_INCREASE << SEQUENCE_BITS);

const DATA_CENTER_ID_DECONSTRUCT_MASK = DATA_CENTER_ID_MASK << DATA_CENTER_ID_SHIFT;
const MACHINE_ID_DECONSTRUCT_MASK = MACHINE_ID_MASK << MACHINE_ID_SHIFT;

export interface SnowflakeOptions {
    epoch?: bigint;
    dataCenterId?: bigint;
    machineId?: bigint;
}

export interface SnowflakeGenerateOptions {
    timestamp: bigint;
    sequence: bigint;
}

export interface SnowflakeDeconstructOptions {
    epoch: bigint;
}

export interface DeconstructedSnowflake {
    timestamp: bigint;
    dataCenterId: bigint;
    machineId: bigint;
    sequence: bigint;
}

/** Wait until the next millisecond. */
const waitNextMillis = (latestTimestamp: bigint): bigint => {
    let timestamp = BigInt(Date.now());

    while (timestamp <= latestTimestamp) {
        timestamp = BigInt(Date.now());
    }

    return timestamp;
};

/**
 * Snowflake ID - Twitter's distributed unique ID generator.
 *
 * Structure (64 bits total):
 * - Sign bit: 1 bit (always 0)
 * - Timestamp: 41 bits (milliseconds since epoch)
 * - Data center ID: 5 bits (0-31)
 * - Machine ID: 5 bits (0-31)
 * - Sequence: 12 bits (0-4095)
 */
export class Snowflake {
    /** Snowflake start epoch */
    readonly epoch: bigint;

    /** Internal data center ID */
    readonly dataCenterId: bigint;

    /** Internal machine ID */
    readonly machineId: bigint;

    /** Sequence increment for the current millisecond */
    #sequence: bigint = DEFAULT_SEQUENCE;

    /** Latest timestamp */
    #latestTimestamp: bigint = BigInt(Date.now());

    constructor({
        epoch = Epoch.OmniLLM,
        dataCenterId = DEFAULT_VALUE,
        machineId = DEFAULT_VALUE,
    }: SnowflakeOptions = {}) {
        this.epoch = epoch;

        this.dataCenterId = dataCenterId & DATA_CENTER_ID_MASK;
        this.machineId = machineId & MACHINE_ID_MASK;
    }

    /**
     * Generate a Snowflake.
     *
     * @throws {Error} If clock moves backwards
     */
    nextId(): bigint {
        let timestamp = BigInt(Date.now());

        if (timestamp < this.#latestTimestamp) {
            throw new Error(
                'Clock moved backwards. Refusing to generate ID for '
                + `${this.#latestTimestamp - timestamp} milliseconds`,
            );
        }

        if (timestamp === this.#latestTimestamp) {
            this.#sequence = (this.#sequence + UNSIGNED_INCREASE) & SEQUENCE_MASK;

            if (this.#sequence === DEFAULT_SEQUENCE) {
                // Sequence exhausted, wait for next millisecond
                timestamp = waitNextMillis(this.#latestTimestamp);
            }
        } else {
            this.#sequence = DEFAULT_SEQUENCE;
        }

        this.#latestTimestamp = timestamp;

        return this.generateCustomId({
            timestamp,
            sequence: this.#sequence,
        });
    }

    /** Generate a custom Snowflake */
    generateCustomId({ timestamp, sequence }: SnowflakeGenerateOptions): bigint {
        return (
            ((timestamp - this.epoch) << TIMESTAMP_SHIFT)
            | (this.dataCenterId << DATA_CENTER_ID_SHIFT)
            | (this.machineId << MACHINE_ID_SHIFT)
            | sequence
        );
    }

    /** Deconstruct the Snowflake with local epoch */
    deconstruct(snowflake: bigint): DeconstructedSnowflake {
        return Snowflake.deconstruct(snowflake, {
            epoch: this.epoch,
        });
    }

    /** Deconstruct the Snowflake timestamp */
    static deconstructTimestamp(snowflake: bigint, epoch: bigint): bigint {
        return (snowflake >> TIMESTAMP_SHIFT) + epoch;
    }

    /** Deconstruct the Snowflake data center ID */
    static deconstructDataCenterId(snowflake: bigint): bigint {
        return (snowflake & DATA_CENTER_ID_DECONSTRUCT_MASK) >> DATA_CENTER_ID_SHIFT;
    }

    /** Deconstruct the Snowflake machine ID */
    static deconstructMachineId(snowflake: bigint): bigint {
        return (snowflake & MACHINE_ID_DECONSTRUCT_MASK) >> MACHINE_ID_SHIFT;
    }

    /** Deconstruct the Snowflake sequence */
    static deconstructSequence(snowflake: bigint): bigint {
        return snowflake & SEQUENCE_MASK;
    }

    /** Deconstruct the Snowflake */
    static deconstruct(snowflake: bigint, { epoch }: SnowflakeDeconstructOptions): DeconstructedSnowflake {
        return {
            timestamp: Snowflake.deconstructTimestamp(snowflake, epoch),
            dataCenterId: Snowflake.deconstructDataCenterId(snowflake),
            machineId: Snowflake.deconstructMachineId(snowflake),
            sequence: Snowflake.deconstructSequence(snowflake),
        };
    }
}
