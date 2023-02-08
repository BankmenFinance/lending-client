use std::str::{from_utf8, Utf8Error};

/// Encodes a string into an array of bytes fixed with 32 length.
#[inline(always)]
pub fn encode_string(alias: &str) -> [u8; 32] {
    let mut encoded = [0_u8; 32];
    let alias_bytes = alias.as_bytes();
    assert!(alias_bytes.len() <= 32);
    for (i, byte) in alias_bytes.iter().enumerate() {
        encoded[i] = *byte;
    }
    encoded
}

#[inline(always)]
pub fn decode_string(data: &[u8]) -> Result<String, Utf8Error> {
    let str = match from_utf8(data) {
        Ok(s) => s,
        Err(e) => {
            return Err(e);
        }
    };
    let str = str.trim_matches(char::from(0));
    Ok(str.to_string())
}
