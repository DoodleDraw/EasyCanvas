export class Vector {

    /**
     * Two-dimensional zero vector
     * @returns {number[]} - zero vector
     */
    static zero() {
        return [0, 0];
    }

    /**
     * n-dimensional vector addition
     * @param a {number[]} - first vector
     * @param b {number[]} - second vector
     * @returns {number[]} - addition result
     */
    static add(a, b) {
        return a.map((v, i) => v + b[i]);
    }

    /**
     * n-dimensional vector subtraction
     * @param a {number[]} - first vector
     * @param b {number[]} - second vector
     * @returns {number[]} - subtraction result
     */
    static sub(a, b) {
        return a.map((v, i) => v - b[i]);
    }

    /**
     * n-dimensional vector multiplication (by number)
     * @param a {number[]} - vector
     * @param k {number} - coefficient
     * @returns {number[]} - multiplication result
     */
    static mul(a, k) {
        return a.map(v => v * k);
    }

    /**
     * Squared Euclidean norm
     * @param a {number[]}
     * @returns {number}
     */
    static lengthSqr(a) {
        return a.reduce((prev, cur) => prev + cur * cur, 0);
    }

    /**
     * Euclidean norm
     * @param a {number[]}
     * @returns {number}
     */
    static length(a) {
        return Math.sqrt(this.lengthSqr(a));
    }

    /**
     * Euclidean distance
     * @param a {number[]}
     * @param b {number[]}
     * @returns {number}
     */
    static distance(a, b) {
        return this.length(this.sub(a, b));
    }

    /**
     * n-dimensional dot product of two vectors
     * @param a {number[]}
     * @param b {number[]}
     * @returns {number}
     */
    static dot(a, b) {
        return a.reduce((prev, cur, i) => prev + cur * b[i], 0);
    }

    /**
     * 2 or 3 -dimensional cross product of two vectors
     * @param a {number[]}
     * @param b {number[]}
     * @returns {number}
     */
    static cross(a, b) {
        if (a.length === 2) {
            return a[0] * b[1] - a[1] * b[0];
        }
        if (a.length === 3) {
            return [
                a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]
            ];
        }
        throw new Error("Unsupported dimension");
    }

    /**
     * 2-dimensional rotation relative to some point |origin| or (0; 0) if not specified
     * @param v {number[]} - vector to rotate
     * @param angle {number}
     * @param origin {number[]?}
     * @returns {number[]}
     */
    static rotate(v, angle, origin) {
        if (!origin) {
            return [
                v[0] * Math.cos(angle) - v[1] * Math.sin(angle),
                v[0] * Math.sin(angle) + v[1] * Math.cos(angle)
            ];
        }
        return Vector.add(Vector.rotate(Vector.sub(v, origin), angle), origin);
    }

    /**
     * 2-dimensional scaling relative to some point |origin| or (0; 0) if not specified
     * @param v {number[]} - vector to rotate
     * @param scale {number} - scale factor
     * @param origin {number[]?}
     * @returns {number[]}
     */
    static scale(v, scale, origin) {
        if (!origin) {
            return Vector.mul(v, scale);
        }
        return Vector.add(Vector.scale(Vector.sub(v, origin), scale), origin);
    }

    /**
     * 2-dimensional direction vector from polar angle
     * @param angle {number} - polar angle
     * @returns {number[]} - unary direction
     */
    static dirByAngle(angle) {
        angle = angle / 180 * Math.PI;
        return [Math.cos(angle), Math.sin(angle)];
    }
}
