export function adderRateType() {
  const typeConstants = [
    {
      value: "per_sq_feet_of_roof_area",
      label: "Per sq ft. (of roof area)",
    },
    {
      value: "per_watt_of_system_size",
      label: "Per watt (of system size)",
    },
    {
      value: "per_panel",
      label: "Per panel",
    },
    {
      value: "percentage_of_system_cost",
      label: "Percentage (of system cost)",
    },
    {
      value: "flat_rate",
      label: "Flat rate",
    },
    {
      label: "Only roof containing panels",
      value: "only_roof_containing_panels",
    },
    {
      label: "Underneath arrays",
      value: "underneath_arrays",
    },
    {
      label: "All roof faces on buildings with solar panels",
      value: "all_roof_faces_with_solar_panles",
    },
    {
      label: "Adder",
      value: "adder",
    },
    {
      label: "Discount",
      value: "discount",
    },
  ];

  return typeConstants;
}
