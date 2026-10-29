DROP PROCEDURE IF EXISTS otp_handler;
CREATE PROCEDURE otp_handler(
    IN user_uuid_arg CHAR(36),
    IN otp_arg INT(6),
    IN otp_for_arg varchar(100)
)
BEGIN
    DECLARE generated_otp INT(6);
    DECLARE otp_p INT(6) DEFAULT IFNULL(otp_arg,0);
    DECLARE valid_otp INT DEFAULT 0;
    IF otp_p=0 THEN

        SET generated_otp = FLOOR(RAND() * 900000) + 100000;

        INSERT INTO otps (user_uuid, otp ,otp_for)
            VALUES (user_uuid_arg, generated_otp, otp_for_arg)
        ON DUPLICATE KEY UPDATE otp = generated_otp;

        select generated_otp as value;

    ELSE
        
        SELECT COUNT(*) into valid_otp FROM otps WHERE user_uuid=user_uuid_arg AND otp=otp_p AND otp_for = otp_for_arg AND insert_ts > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 MINUTE);
        
        Select valid_otp as value;

        DELETE FROM otps
            WHERE user_uuid=user_uuid_arg AND otp=otp_p AND otp_for = otp_for_arg;

    END IF;
END;