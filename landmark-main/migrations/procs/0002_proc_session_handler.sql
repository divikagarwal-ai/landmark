DROP PROCEDURE IF EXISTS session_handler;
CREATE PROCEDURE session_handler(
    IN user_uuid_arg CHAR(36),
    IN access_token_arg VARCHAR(5000),
    IN session_count_arg INT,
    IN action_type_arg VARCHAR(10),
    IN max_session_count_arg INT
)
BEGIN
    DECLARE no_of_session int DEFAULT 0;
    DECLARE session_count_v int DEFAULT 0;
    DECLARE loggedin_session_count_v int DEFAULT 0;


    IF action_type_arg = 'LOGIN' THEN
        
        SELECT COUNT(1) INTO no_of_session FROM user_session WHERE user_uuid=user_uuid_arg ORDER BY insert_ts limit 1;
        
        IF no_of_session < max_session_count_arg THEN
            
            select max(session_count) into session_count_v from user_session where user_uuid=user_uuid_arg;

            INSERT INTO user_session (user_uuid,session_count,access_token) VALUES (user_uuid_arg,session_count_v+1,access_token_arg);

            select session_count_v+1 session_count;

        ELSE

            select count(1) into loggedin_session_count_v from user_session where user_uuid=user_uuid_arg and access_token is not  NULL;

            select session_count into session_count_v from user_session where user_uuid=user_uuid_arg and access_token is NULL limit 1;
            
            IF session_count_v = 0 or loggedin_session_count_v >= max_session_count_arg THEN
                -- Throw an error if session count exceeds limit
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'You logged in so many devices. Please logout from one or all devices to login again.', MYSQL_ERRNO = 1001;
            ELSE
                UPDATE user_session SET access_token=access_token_arg WHERE user_uuid=user_uuid_arg and session_count = session_count_v;

                select session_count_v session_count;

            END IF;

        END IF;

    ELSEIF action_type_arg = 'LOGOUT' THEN
        IF session_count_arg = 0 THEN
            UPDATE user_session SET access_token=NULL WHERE user_uuid=user_uuid_arg;
        ELSE
            UPDATE user_session SET access_token=NULL WHERE user_uuid=user_uuid_arg and session_count = session_count_arg;
        END IF;
    
    END IF;
    
END;