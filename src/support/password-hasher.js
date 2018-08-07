import crypto from 'crypto';

export class PasswordHasher{

  verifyPassword(password, salt, oldHash){
    let hash = this.sha512(password, salt);
    return hash.hash === oldHash;
  }

  generateHash(password){
    let salt = this.generateRandomString(16); /** Gives us salt of length 16 */
    let passwordHashResult = this.sha512(password, salt);
    return passwordHashResult;
  }

  generateRandomString(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */
  }

  sha512(password, salt){
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    let value = hash.digest('base64');
    return {
      salt:salt,
      hash:value
    };
  }
}
