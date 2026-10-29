DROP PROCEDURE IF EXISTS `Generatecalendar`;

CREATE PROCEDURE Generatecalendar(IN StartDateParam DATE, IN EndDateParam DATE)
BEGIN
    DECLARE calendar_unique_id_var INT;
    DECLARE StartDate DATE;
    DECLARE EndDate DATE;
    DECLARE calendar_uuid_v CHAR(36);

    SET StartDate = StartDateParam;
    SET EndDate = EndDateParam;
    -- Get the current maximum calendar_unique_id
    SELECT COALESCE(MAX(calendar_unique_id), 0) INTO calendar_unique_id_var FROM calendar;


    WHILE StartDate <= EndDate DO

    SET calendar_uuid_v = UUID();
    SET calendar_unique_id_var = calendar_unique_id_var + 1 ; 

        INSERT INTO calendar (
            calendar_unique_id,
            calendar_uuid,
            calendarDate,
            calendarDay,
            calendarMonth,
            calendarQuarter,
            calendarYear,
            DayOfWeekNum,
            DayOfWeekName,
            DateNum,
            QuarterCD,
            MonthNameCD,
            FullMonthName,
            HolidayName,
            HolidayFlag
        )
        VALUES (
            calendar_unique_id_var,
            calendar_uuid_v,
            StartDate,
            DAY(StartDate),
            MONTH(StartDate),
            QUARTER(StartDate),
            YEAR(StartDate),
            DAYOFWEEK(StartDate),
            DAYNAME(StartDate),
            DATE_FORMAT(StartDate, '%Y%m%d'),
            CONCAT(YEAR(StartDate), 'Q', QUARTER(StartDate)),
            LEFT(MONTHNAME(StartDate), 3),
            MONTHNAME(StartDate),
            NULL,
            'N'
        );

        SET StartDate = DATE_ADD(StartDate, INTERVAL 1 DAY);
    END WHILE;
END;
