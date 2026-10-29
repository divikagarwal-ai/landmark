DROP PROCEDURE IF EXISTS role_content_access;
create PROCEDURE role_content_access(
    IN role_uuid_arg CHAR(36),
    IN table_name_arg VARCHAR(200)
)
BEGIN
    IF table_name_arg IS NULL THEN
         select 
         rl.role_module_uuid
        ,m.*
        , IFNULL(rl.show_module,0) show_module
        , IFNULL(rl.view_access,0) view_access
        , IFNULL(rl.edit_access,0) edit_access
        , IFNULL(rl.send_sms,0) send_sms
        , IFNULL(rl.send_mail,0) send_mail
        , IFNULL(rl.send_whatsapp,0) send_whatsapp
        , IFNULL(rl.send_call,0) send_call
        , IFNULL(rl.filter_values, JSON_OBJECT()) filter_values
        , rl.status
        from 
            (select 
            module_uuid
            ,module_name
            ,submodule_name
            ,table_name
            , map_column_user_uuid
            ,column_relation_options
            , role_uuid_arg as role_uuid
            from module) m 
        left join 
        latest_role_module rl 
        on m.role_uuid = rl.role_uuid and m.module_uuid = rl.module_uuid;

    ELSE
         select 
         rl.role_module_uuid
        ,m.*
        , IFNULL(rl.show_module,0) show_module
        , IFNULL(rl.view_access,0) view_access
        , IFNULL(rl.edit_access,0) edit_access
        , IFNULL(rl.send_sms,0) send_sms
        , IFNULL(rl.send_mail,0) send_mail
        , IFNULL(rl.send_whatsapp,0) send_whatsapp
        , IFNULL(rl.send_call,0) send_call
        , IFNULL(rl.filter_values, JSON_OBJECT()) filter_values
        , rl.status
        from 
            (select 
            module_uuid
            ,module_name
            ,submodule_name
            ,table_name
            , map_column_user_uuid
            ,column_relation_options
            , role_uuid_arg as role_uuid
            from module) m 
        left join 
        latest_role_module rl 
        on m.role_uuid = rl.role_uuid and m.module_uuid = rl.module_uuid where m.table_name= table_name_arg;
    END IF;
END;