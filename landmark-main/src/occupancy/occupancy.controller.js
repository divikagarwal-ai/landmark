const {
  isEditAccess,
  filterFunctionality,
  roleFilterService,
  pagination,
  getCountRecord,
  getRecords,
  insertRecords,
  dbRequest,
} = require('../../utils/dbFunctions');
const {
  removeNullValueKey,
  setDateTimeFormat,
  responser,
  throwError,
  deleteKeyValuePair,
  requestApi,
} = require('../../utils/helperFunction');
const { v4: uuidv4, v4 } = require('uuid');
const {
  sendEmailService,
  saveHistory,
} = require('../../utils/microservice_func');
const { base_url } = require('../../config/server.config');
const moment = require('moment');

function isDateValid(from_date) {
  const today = new Date();
  const inputDate = new Date(from_date);
  console.log('Input Date:', inputDate);

  // Resetting the time part of both dates to ensure only date comparison
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate >= today;
}

// exports.getOccupancy = async (req, res) => {
//   const { venue_uuid, from_date, to_date } = req.query;

//   let calendar_table = 'latest_calendar';
//   let room_type_table = 'latest_venue';
//   let invantory_table = 'latest_occupancy';
//   let event_timing_table = 'event_timing';

//   let calendar = await getRecords(
//     calendar_table,
//     `WHERE CalendarDate >='${from_date}' AND CalendarDate <='${to_date}'`,

//     null,
//     null,
//     {
//       includeUniqueId: false,
//     },
//   );
//   // console.log(calendar, 'calender');

//   let shift_times = await getRecords(
//     event_timing_table,
//     null, // Get all shift times
//     null,
//     null,
//     { includeUniqueId: false }
//   );

//   let room_type = await getRecords(
//     room_type_table,
//     `WHERE venue_uuid = '${venue_uuid}'`,
//     null,
//     null,
//     {
//       includeUniqueId: false,
//     },
//   );

//   if (!room_type[0]) {
//     console.log(room_type);
//     return throwError(404, 'room not found');
//   }
//   console.log(calendar, 'calender');
//   let invantory = await getRecords(
//     invantory_table,
//     `WHERE venue_uuid = '${venue_uuid}' AND ( ${calendar.map((entry) => `calendar_uuid = '${entry.calendar_uuid}'`).join(' OR ')} ) `,
//     null,
//     null,
//     {
//       includeUniqueId: false,
//     },
//   );

//   const output = calendar.reduce((acc, cal) => {
//     acc[setDateTimeFormat('date', cal.CalendarDate)] = room_type.flatMap((v) => {
//       let relevantInventories = invantory.filter(
//         (inv) => inv.venue_uuid === v.venue_uuid && inv.calendar_uuid === cal.calendar_uuid
//       );

//       let shiftGroups = relevantInventories.reduce((grouped, inv) => {
//         if (!grouped[inv.shift_time]) {
//           grouped[inv.shift_time] = [];
//         }
//         grouped[inv.shift_time].push(inv);
//         return grouped;
//       }, {});

//       let shiftEntries = Object.values(shiftGroups).map((shiftBookings) => {
//         shiftBookings.sort((a, b) => new Date(b.insert_ts) - new Date(a.insert_ts));
//         return shiftBookings[0]; // Latest booking per shift
//       });

//       // Ensure all shift times are accounted for
//       let allShiftTimes = shift_times.map((st) => st.shift_time);

//       let activeEntries = allShiftTimes
//         .filter((st) => !shiftEntries.some((entry) => entry.shift_time === st))
//         .map((st) => ({
//           occupancy_uuid: null,
//           shift_time: st,
//           venue_uuid: v.venue_uuid,
//           venue_name: v.venue_name,
//           calendar_uuid: cal.calendar_uuid,
//           calendar_date: cal.CalendarDate,
//           status: "ACTIVE",
//         }));

//       return [...shiftEntries, ...activeEntries]; // Merge booked & active shifts
//     });

//     return acc;
//   }, {});

//   res.json(responser('All Inventory Details .', output));
// };

exports.getOccupancy = async (req, res) => {
  const { venue_uuid, from_date, to_date } = req.query;

  let calendar_table = 'latest_calendar';
  let venue_table = 'latest_venue';
  let invantory_table = 'latest_occupancy';
  let event_timing_table = 'event_timing'; // Table containing shift times

  let calendar = await getRecords(
    calendar_table,
    `WHERE CalendarDate >='${from_date}' AND CalendarDate <='${to_date}'`,
    null,
    null,
    { includeUniqueId: false },
  );

  let venueFilter = filterFunctionality({ venue_uuid }, 'ACTIVE');
  let venue = await getRecords(venue_table, venueFilter, null, null, {
    includeUniqueId: false,
  });

  if (!venue[0]) {
    return throwError(404, 'Venue not found');
  }

  let shift_times = await getRecords(
    event_timing_table,
    null, // Get all shift times
    null,
    null,
    { includeUniqueId: false },
  );

  // Extract unique shift times (to avoid duplicates)
  let uniqueShiftTimes = [...new Set(shift_times.map((st) => st.shift_time))];
  let inventoryFilter = filterFunctionality({ venue_uuid });
  let invantory = await getRecords(
    invantory_table,
    `${inventoryFilter ? `${inventoryFilter} AND` : 'Where'} (${calendar
      .map((entry) => `calendar_uuid = '${entry.calendar_uuid}'`)
      .join(' OR ')})`,
    null,
    null,
    { includeUniqueId: false },
  );

  console.log('----->', invantory);

  const output = calendar.reduce((acc, cal) => {
    acc[setDateTimeFormat('date', cal.CalendarDate)] = venue.flatMap((v) => {
      let relevantInventories = invantory.filter(
        (inv) =>
          inv.venue_uuid === v.venue_uuid &&
          inv.calendar_uuid === cal.calendar_uuid,
      );

      let shiftGroups = relevantInventories.reduce((grouped, inv) => {
        if (!grouped[inv.shift_time]) {
          grouped[inv.shift_time] = [];
        }
        grouped[inv.shift_time].push(inv);
        return grouped;
      }, {});

      let shiftEntries = Object.values(shiftGroups).map((shiftBookings) => {
        shiftBookings.sort(
          (a, b) => new Date(b.insert_ts) - new Date(a.insert_ts),
        );
        return shiftBookings[0];
      });

      let transformedEntries = shiftEntries.map((entry) => {
        if (entry.status === 'CANCELLED') {
          return {
            occupancy_uuid: null,
            shift_time: entry.shift_time,
            venue_uuid: v.venue_uuid,
            venue_name: v.venue_name,
            calendar_uuid: cal.calendar_uuid,
            calendar_date: cal.CalendarDate,
            status: 'ACTIVE',
          };
        }
        return entry;
      });

      let activeEntries = uniqueShiftTimes
        .filter(
          (st) => !transformedEntries.some((entry) => entry.shift_time === st),
        )
        .map((st) => ({
          occupancy_uuid: null,
          shift_time: st,
          venue_uuid: v.venue_uuid,
          venue_name: v.venue_name,
          calendar_uuid: cal.calendar_uuid,
          calendar_date: cal.CalendarDate,
          status: 'ACTIVE',
        }));

      return [...transformedEntries, ...activeEntries];
    });

    return acc;
  }, {});

  res.json(responser('All Inventory Details', output));
};

exports.upsertOccupancy = async (req, res) => {
  await isEditAccess('latest_booking', req.user);
  removeNullValueKey(req.body);
  let oldRecord = {};
  if (req.body.occupancy_uuid) {
    oldRecord = (
      await getRecords(
        'latest_occupancy',
        `where occupancy_uuid="${req.body.occupancy_uuid}"`,
      )
    )[0];
    if (!oldRecord) throwError(400, 'Invalid occpancy.');
    req.body = { ...oldRecord, ...req.body };
  } else {
    let bookingDetails = await dbRequest(
      ` select * from latest_occupancy where venue_uuid="${req.body.venue_uuid}" and calendar_uuid="${req.body.calendar_uuid}"  and status="BOOKED"`,
    );
    if (
      bookingDetails.some(
        (ele) =>
          ele.shift_time === req.body.shift_time || ele.shift_time === 'DAY',
      ) ||
      (bookingDetails.length && req.body.shift_time === 'DAY')
    )
      throwError(
        400,
        'This venue is already booked. Please try booking another venue.',
      );
    req.body.occupancy_uuid = v4();
  }
  insertResp = await insertRecords('occupancy', req.body);
  res.json(responser('Venue has been booked.', req.body));
  // <---------------- history entry ---------------->
  saveHistory(
    {
      oldRecord,
      newRecord: req.body,
    },
    'occupancy',
    'occupany_uuid',
    'Booking',
    insertResp.insertId,
    req.user,
  );
};

exports.upsertBulkOccupancy = async (req, res) => {
  const { from_date, to_date } = req.body;
  await isEditAccess('latest_inventory', req.user);
  removeNullValueKey(req.body);
  let isUpadtion = false;

  // if (!isDateValid(from_date)) return throwError(404, 'Invalid date format');

  let calendar = await getRecords(
    'latest_calendar',
    `WHERE CalendarDate >='${from_date}' AND CalendarDate <='${to_date}'`,

    null,
    null,
    {
      includeUniqueId: false,
    },
  );

  const inventory_data = await Promise.all(
    calendar.map(async (cal) => {
      let occupancy_info = await getRecords(
        'latest_occupancy',
        `where venue_uuid='${req.body.venue_uuid}' AND calendar_uuid='${cal.calendar_uuid}'`,
      );
      // console.log('latest inventory', inventory_info);
      if (occupancy_info.length) {
        occupancy_info = occupancy_info[0];
        // console.log('if block');

        return { ...occupancy_info, ...req.body };
      } else {
        // console.log('else block');
        return {
          occupancy_uuid: uuidv4(),

          venue_name: req.body.venue_name,
          venue_uuid: req.body.venue_uuid,
          venue_shift: req.body.venue_shift,
          shift_time: req.body.shift_time,
          is_venue_available: req.body.is_venue_available,
          venue_address: req.body.venue_address,
          price: req.body.price,
          capacity: req.body.capacity,
          calendar_uuid: cal.calendar_uuid,
          calendar_date: cal.CalendarDate,
          status: 'ACTIVE',
          created_by_uuid: req.body.created_by_uuid,
          created_by_name: req.body.created_by_name,
          modified_by_uuid: req.body.modified_by_uuid,
          modified_by_name: req.body.modified_by_name,
          create_ts: setDateTimeFormat('timestamp'),
        };
      }
    }),
  );
  console.log(inventory_data, 'invertory');

  //   change require
  let inventory = await insertRecords('occupancy', inventory_data);
  res.json(responser('inventory created  successfully.', inventory_data));
};

exports.getBooking = async (req, res) => {
  const {
    booking_uuid,
    venue_uuid,
    occupancy_uuid,
    customer_fact_uuid,
    pageNo,
    itemPerPage,
    from_date,
    pageLimit,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  //   let roles = ['ADMIN', 'SUPERADMIN'];
  //   let user_uuid = !roles.includes(req.user.role_value)
  //     ? `${req.user.user_uuid}`
  //     : null;

  let tableName = 'latest_booking';
  let filter = filterFunctionality(
    {
      booking_uuid,
      venue_uuid,
      customer_fact_uuid,
      occupancy_uuid,
      //   user_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  filter = await roleFilterService(filter, tableName, req.user);
  let pageFilter = pagination(pageNo, itemPerPage, pageLimit);
  let totalRecords = await getCountRecord(tableName, filter);
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  return res.json(
    responser('All Booking', result, result.length, totalRecords),
  );
};

exports.Booking = async (req, res) => {
  const { venue_uuid, from_date, to_date, event_time_uuid } = req.body;

  let eventTime = (
    await getRecords(
      'latest_event_timing',
      filterFunctionality({ event_timing_uuid: event_time_uuid }),
    )
  )[0];
  if (!eventTime) throwError(400, 'Event Time is required');

  let calendar_table = 'latest_calendar';
  let calendar = (
    await getRecords(
      calendar_table,
      `WHERE CalendarDate >= '${moment(from_date).format('YYYY-MM-DD')}' AND CalendarDate <= '${moment(to_date).format('YYYY-MM-DD')}'`,
      null,
      null,
      {
        includeUniqueId: false,
      },
    )
  )[0];

  req.body.booking_uuid = uuidv4();
  req.body.create_ts = setDateTimeFormat('timestamp');

  let [venue] = await getRecords(
    'latest_venue',
    `WHERE venue_uuid = '${venue_uuid}'`,
  );

  if (!venue) {
    req.body.status = 'BOOKING_FAILED';
    await insertRecords('booking', req.body);
    return throwError(404, 'Property details not found.');
  }

  req.body = { ...req.body, ...venue };

  console.log('req.user==================>', req.user);

  let resp = (
    await requestApi(
      base_url + '/api/v1/occupancy/upsert-occupancy',
      null,
      'POST',
      {
        'Content-Type': 'application/json',
        'auth-Token': req.user.access_token,
      },
      {
        ...venue,
        shift_time: eventTime.shift_time,
        calendar_uuid: calendar.calendar_uuid,
        calendar_date: calendar.CalendarDate,
        status: 'BOOKED',
      },
    )
  ).data;

  // Update status to BOOKED
  req.body.status = 'BOOKED';
  // Insert booking
  await insertRecords('booking', {
    ...req.body,
    ...resp,
    user_uuid: req.user.user_uuid,
    shift_time: eventTime.shift_time,
  });
  console.log('Booking created successfully');
  res.json(responser('Booking created successfully.', req.body));
  // ACTIVE FROM PROSPECT
  (async () => {
    try {
      let customer = (
        await getRecords(
          'customer_fact',
          `where customer_fact_uuid='${req.body.customer_fact_uuid}'`,
        )
      )[0];
      console.log('customer in booking=====>', customer);
      if (customer.status.toUpperCase() === 'PROSPECT') {
        await requestApi(
          base_url + '/api/v1/customer/upsert-customer',
          null,
          'POST',
          {
            'Content-Type': 'application/json',
            'auth-Token': req.user.access_token,
          },
          {
            ...customer,
            status: 'ACTIVE',
          },
        );
      }
    } catch (err) {
      console.log('err', err);
    }
  })();
};

exports.cancelBooking = async (req, res) => {
  const { booking_uuid } = req.body;
  let Booking = (
    await getRecords(`latest_booking`, `where booking_uuid='${booking_uuid}'`)
  )[0];
  if (!Booking) return throwError(404, 'Invalid Booking ID');

  if (Booking.status === 'BOOKED') {
    let update_Booking = {
      ...Booking,
      status: 'CANCEL_BOOKING',
    };
    if (update_Booking.status === 'CANCEL_BOOKING') {
      let resp = (
        await requestApi(
          base_url + '/api/v1/occupancy/upsert-occupancy',
          null,
          'POST',
          {
            'Content-Type': 'application/json',
            'auth-Token': req.user.access_token,
          },
          {
            occupancy_uuid: Booking.occupancy_uuid,
            status: 'CANCELLED',
          },
        )
      ).data;
    }

    await insertRecords('booking', update_Booking);

    return res.json(responser('Request for Booking Cancellation .'));
  } else {
    return throwError(
      404,
      'Booking is not confirmed or may be alreadycancelled',
    );
  }
};
exports.BookingApproval = async (req, res) => {
  const { booking_uuid, status } = req.body;

  let [Booking] = await getRecords(
    `latest_booking`,
    `where booking_uuid='${booking_uuid}' AND status = 'REQUESTED'`,
  );

  if (!Booking) return throwError(404, 'Invalid Booking ID');
  console.log('Booking : ', Booking);

  //get email of property manager
  const { property_details_uuid } = Booking;
  let [property] = await getRecords(
    'latest_property_details',
    `where property_details_uuid='${property_details_uuid}'`,
  );
  if (!property_details_uuid) return throwError(404, 'Invalid property ID');

  const [property_manager] = await getRecords(
    'latest_user',
    `where user_uuid='${property.user_uuid}'`,
  );

  if (status === 'CONFIRMED') {
    const { property_details_uuid, room_types_uuid } = Booking;

    let from_date = setDateTimeFormat('date', Booking.from_date);
    let to_date = setDateTimeFormat('date', Booking.to_date);

    let calendar_table = 'latest_calendar';
    let calendar = await getRecords(
      calendar_table,
      `WHERE CalendarDate >='${from_date}' AND CalendarDate < '${to_date}'`,
      null,
      null,
      {
        includeUniqueId: false,
      },
    );

    let [avilable_hotel] =
      await dbRequest(`SELECT property_details_uuid, room_types_uuid
      FROM latest_inventory
      WHERE
        property_details_uuid = '${property_details_uuid}' 
        AND room_types_uuid = '${room_types_uuid}'
        AND available_room > 0 
        AND property_details_uuid IN (
          SELECT property_details_uuid
          FROM latest_inventory
          WHERE property_details_uuid = '${property_details_uuid}' 
          AND room_types_uuid = '${room_types_uuid}'
          AND available_room > 0
          AND calendar_uuid IN (${calendar.map((uuid) => `'${uuid.calendar_uuid}'`).join(', ')})
          GROUP BY property_details_uuid, room_types_uuid
          HAVING COUNT(DISTINCT calendar_uuid) = ${calendar.length}
        )
      GROUP BY property_details_uuid, room_types_uuid`);

    console.log('HOTEL', avilable_hotel);
    if (!avilable_hotel) {
      return throwError(404, 'Hotels are not avilable');
    }

    let inventory_table = 'latest_inventory';
    let inventory = await getRecords(
      inventory_table,
      `WHERE Calendar_date >='${from_date}' AND Calendar_date <= '${to_date}' AND property_details_uuid='${Booking.property_details_uuid}' AND room_types_uuid='${Booking.room_types_uuid}'`,
    );

    let Update_Inventory = inventory.map((inventory) => {
      return { ...inventory, available_room: inventory.available_room - 1 };
    });

    await insertRecords('inventory', Update_Inventory);

    // alert mail for low inventory
    Update_Inventory?.map((inventory) => {
      if (inventory.available_room < 10) {
        sendEmailService(
          [property_manager.email],
          `ALERT! Inventory low for ${property.property_details_name}`,
          '',
          'inventoryLowAlert.ejs',
          {
            propertyName: property.property_details_name,
            roomType: Booking.room_types_name,
            propertyManager: property_manager.full_name,
            availableRoom: inventory.available_room,
          },

          [],
          [],
          null,
          [],
        );
      }
    });

    console.log('updated Inventory = ', Update_Inventory);

    // book room
    let update_Booking = {
      ...Booking,
      ...req.body,
    };

    await insertRecords('booking', update_Booking);

    // invantory decriment
  } else {
    let update_Booking = {
      ...Booking,
      ...req.body,
    };

    await insertRecords('booking', update_Booking);
  }

  console.log('email : ', Booking.customer_email);
  console.log('email - property manager : ', property_manager.email);

  //sending mail to customer
  sendEmailService(
    [Booking.customer_email],
    `YOUR BOOKING ${status} FOR ${Booking.property_details_name}`,
    '',
    'CustomerBookingApproval.ejs',
    {
      status: status,
      propertyManagerName: property_manager.full_name,
      propertyManagerEmail: property_manager.email,
      propertyName: Booking.property_details_name,
      customerName: Booking.customer_name,
      roomType: Booking.room_types_name,
      checkInDate: setDateTimeFormat('date', Booking.from_date),
      checkoutDate: setDateTimeFormat('date', Booking.to_date),
      customerEmail: Booking.customer_email,
      customerNumber: Booking.customer_mobile_no,
      propertyImage: property.property_images,
      addressOfProperty: [
        property.property_address_line_1,
        property.property_address_line_2,
        property.property_city,
        property.property_state,
        property.property_pincode,
        property.property_country,
      ].join(', '),
      totalGuest: Booking.total_guest,
      price: Booking.total_price,
      hotelPolicies: property.property_policies,
      rule_allowed: property.rule_allowed,
      rule_not_allowed: property.rule_not_allowed,
    },

    [],
    [],
    null,
    [],
  );

  //sending mail to property manager
  sendEmailService(
    [property_manager.email],
    `BOOKING ${status} !!! `,
    '',
    'ManagerBookingApproval.ejs',
    {
      status: status,
      propertyManagerName: property_manager.full_name,
      propertyName: Booking.property_details_name,
      customerName: Booking.customer_name,
      roomType: Booking.room_types_name,
      checkInDate: setDateTimeFormat('date', Booking.from_date),
      checkoutDate: setDateTimeFormat('date', Booking.to_date),
      customerEmail: Booking.customer_email,
      customerNumber: Booking.customer_mobile_no,
      propertyImage: property.property_images,
      addressOfProperty: [
        property.property_address_line_1,
        property.property_address_line_2,
        property.property_city,
        property.property_state,
        property.property_pincode,
        property.property_country,
      ].join(', '),
      totalGuest: Booking.total_guest,
      price: Booking.total_price,
      hotelPolicies: property.property_policies,
      rule_allowed: property.rule_allowed,
      rule_not_allowed: property.rule_not_allowed,
    },

    [],
    [],
    null,
    [],
  );

  res.json(responser(`booking ${status}  successfully.`, req.body));
};
exports.BookingCancellationAppproval = async (req, res) => {
  const { booking_uuid, status } = req.body;

  let [Booking] = await getRecords(
    `latest_booking`,
    `where booking_uuid='${booking_uuid}' AND status = 'CANCEL REQUEST'`,
  );

  if (!Booking) return throwError(404, 'Invalid Booking ID');
  console.log('Booking : ', Booking);

  //get email of property manager
  const { property_details_uuid } = Booking;
  let [property] = await getRecords(
    'latest_property_details',
    `where property_details_uuid='${property_details_uuid}'`,
  );
  const [property_manager] = await getRecords(
    'latest_user',
    `where user_uuid='${property.user_uuid}'`,
  );

  if (status === 'CANCEL_REQUEST_CONFIRMED') {
    let from_date = setDateTimeFormat('date', Booking.from_date);
    let to_date = setDateTimeFormat('date', Booking.to_date);

    //Inventory Increment in Available Room
    let inventory_table = 'latest_inventory';
    let inventory = await getRecords(
      inventory_table,
      `WHERE Calendar_date >='${from_date}' AND Calendar_date <= '${to_date}' AND property_details_uuid='${Booking.property_details_uuid}' AND room_types_uuid='${Booking.room_types_uuid}'`,
    );

    let Update_Inventory = inventory.map((inventory) => {
      return { ...inventory, available_room: inventory.available_room + 1 };
    });

    await insertRecords('inventory', Update_Inventory);

    //update booking status
    let update_Booking = {
      ...Booking,
      status: 'CANCELLED',
    };

    await insertRecords('booking', update_Booking);
  } else if (status === 'CANCEL_REQUEST_REJECTED') {
    let update_Booking = {
      ...Booking,
      status: 'CONFIRMED',
    };
    await insertRecords('booking', update_Booking);
  } else {
    throwError(400, 'Invalid Status');
  }
  sendEmailService(
    [Booking.customer_email],
    `BOOKING ${status} FOR ${Booking.property_details_name}`,
    '',
    'CustomerBookingApproval.ejs',
    {
      status: status,
      propertyManagerName: property_manager.full_name,
      propertyManagerEmail: property_manager.email,
      propertyName: Booking.property_details_name,
      customerName: Booking.customer_name,
      roomType: Booking.room_types_name,
      checkInDate: setDateTimeFormat('date', Booking.from_date),
      checkoutDate: setDateTimeFormat('date', Booking.to_date),
      customerEmail: Booking.customer_email,
      customerNumber: Booking.customer_mobile_no,
      propertyImage: property.property_images,
      addressOfProperty: [
        property.property_address_line_1,
        property.property_address_line_2,
        property.property_city,
        property.property_state,
        property.property_pincode,
        property.property_country,
      ].join(', '),
      totalGuest: Booking.total_guest,
      price: Booking.total_price,
      hotelPolicies: property.property_policies,
      rule_allowed: property.rule_allowed,
      rule_not_allowed: property.rule_not_allowed,
    },

    [],
    [],
    null,
    [],
  );

  //sending mail to property manager
  sendEmailService(
    [property_manager.email],
    `BOOKING ${status}!!! `,
    '',
    'ManagerBookingApproval.ejs',
    {
      status: status,
      propertyManagerName: property_manager.full_name,
      propertyName: Booking.property_details_name,
      customerName: Booking.customer_name,
      roomType: Booking.room_types_name,
      checkInDate: setDateTimeFormat('date', Booking.from_date),
      checkoutDate: setDateTimeFormat('date', Booking.to_date),
      customerEmail: Booking.customer_email,
      customerNumber: Booking.customer_mobile_no,
      propertyImage: property.property_images,
      addressOfProperty: [
        property.property_address_line_1,
        property.property_address_line_2,
        property.property_city,
        property.property_state,
        property.property_pincode,
        property.property_country,
      ].join(', '),
      totalGuest: Booking.total_guest,
      price: Booking.total_price,
      hotelPolicies: property.property_policies,
      rule_allowed: property.rule_allowed,
      rule_not_allowed: property.rule_not_allowed,
    },

    [],
    [],
    null,
    [],
  );
  res.json(responser(`Booking ${status}  successfully.`, req.body));
};

exports.getEventTiming = async (req, res) => {
  const {
    event_timing_uuid,
    pageNo,
    itemPerPage,
    from_date,
    pageLimit,
    to_date,
    status,
    columns,
    value,
  } = req.query;

  let tableName = 'latest_event_timing';
  let filter = filterFunctionality(
    {
      event_timing_uuid,
    },
    status,
    to_date,
    from_date,
    Array.isArray(columns) ? columns : [columns],
    value,
  );
  // filter = await roleFilterService(filter, tableName, req.user);
  let pageFilter = pagination(pageNo, itemPerPage, pageLimit, {
    preventOrderBy: true,
  });
  let result = await getRecords(tableName, filter, pageFilter, null, {
    includeUniqueId: false,
  });
  return res.json(responser('All Booking', result, result.length));
};
