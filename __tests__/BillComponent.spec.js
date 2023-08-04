// import { shallowMount } from '@vue/test-utils';
// import ParentComponent from '../src/components/adderTable/components/BillComponent.vue';

// describe('ParentComponent', () => {
//   it('adds an item to tableItems when receiving selectedItem event from ChildDropdown', () => {
//     const wrapper = shallowMount(ParentComponent);
//     const item = {
//       name: 'Test Item',
//       defaultValue: 100,
//       defaultQuantity: 2,
//     };
//     wrapper.vm.addItem(item);
//     expect(wrapper.vm.tableItems).toContain(item);
//   });

//   it('updates the total when tableItems change', () => {
//     const wrapper = shallowMount(ParentComponent);
//     const item = {
//       name: 'Test Item',
//       defaultValue: 100,
//       defaultQuantity: 2,
//     };
//     wrapper.vm.addItem(item);
//     expect(wrapper.vm.total).toBe(200);
//   });

//   it('updates the total when valueChanged event is emitted from ChildTable', () => {
//     const wrapper = shallowMount(ParentComponent);
//     const item = {
//       name: 'Test Item',
//       defaultValue: 100,
//       defaultQuantity: 2,
//     };
//     wrapper.setData({ tableItems: [item] });
//     wrapper.vm.updateBackend();
//     expect(wrapper.vm.total).toBe(200);
//   });

//   // it('renders ChildDropdown, ChildTable, and TableSummary components', () => {
//   //   const wrapper = shallowMount(ParentComponent);
//   //   expect(wrapper.findComponent({ name: 'ChildDropdown' }).exists()).toBe(true);
//   //   expect(wrapper.findComponent({ name: 'ChildTable' }).exists()).toBe(true);
//   //   expect(wrapper.findComponent({ name: 'TableSummary' }).exists()).toBe(true);
//   // });

//   it('renders the correct tableHeaders', () => {
//     const wrapper = shallowMount(ParentComponent);
//     const headers = wrapper.vm.tableHeaders;
//     expect(headers).toHaveLength(5);
//     expect(headers[0].id).toBe('name');
//     expect(headers[1].id).toBe('default_amount');
//     expect(headers[2].id).toBe('default_quantity');
//     expect(headers[3].id).toBe('total');
//     expect(headers[4].id).toBe('actions');
//   });
// });


import { shallowMount } from '@vue/test-utils';
import ParentComponent from '../src/components/adderTable/components/BillComponent.vue';
import ChildDropdown from '../src/components/adderTable/components/ChildDropdown.vue';
import ChildTable from '../src/components/adderTable/components/ChildTable.vue';
import TableSummary from '../src/components/adderTable/components/TableSummary.vue';
import API from '../src/services/api';

jest.mock('../src/services/api', () => ({
  ADDERS_DISCOUNTS: {
    POST_ALL_DESIGN_SUMMARY_DATA: jest.fn(),
    DELETE_DESIGN_ADDERS_AND_DISCOUNTS_ID: jest.fn(),
    PATCH_DESIGN_ADDERS_AND_DISCOUNTS_ID: jest.fn(),
  },
  DESIGNS: {
    FETCH_DESIGN: jest.fn(),
  },
}));

describe('ParentComponent', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ParentComponent, {
      propsData: {
        designId: '12345',
      },
      stubs: {
        ChildDropdown: true,
        ChildTable: true,
        TableSummary: true,
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('fetches design data on mount', async () => {
    const fetchDesignMock = API.DESIGNS.FETCH_DESIGN.mockResolvedValueOnce({
      data: {
        adders_discounts: [],
      },
    });

    await wrapper.vm.getDesign();

    expect(fetchDesignMock).toHaveBeenCalledWith('12345');
    expect(wrapper.vm.tableItems).toEqual([]);
  });

  it('adds an item to tableItems and posts data when addItem is called', async () => {
    const item = {
      id: 'item-id',
      rate_type: 'percentage_of_system_cost',
      default_percentage: 10,
      default_quantity: 2,
    };

    const postDataMock = API.ADDERS_DISCOUNTS.POST_ALL_DESIGN_SUMMARY_DATA.mockResolvedValueOnce();

    await wrapper.vm.addItem(item);

    expect(wrapper.vm.tableItems).toEqual([item]);
    expect(postDataMock).toHaveBeenCalledWith({
      adders_discounts: 'item-id',
      amount: 10,
      design: '12345',
      quantity: 2,
    });
  });

  it('deletes table data when deleteTableData is called', async () => {
    const deleteDataMock = API.ADDERS_DISCOUNTS.DELETE_DESIGN_ADDERS_AND_DISCOUNTS_ID.mockResolvedValueOnce();

    await wrapper.vm.deleteTableData('item-id');

    expect(deleteDataMock).toHaveBeenCalledWith('item-id');
  });

  it('updates table data and patches data when updateTable is called', async () => {
    const value = {
      id: 'item-id',
      amount: 20,
      default_quantity: 3,
    };

    const patchDataMock = API.ADDERS_DISCOUNTS.PATCH_DESIGN_ADDERS_AND_DISCOUNTS_ID.mockResolvedValueOnce();

    await wrapper.vm.updateTable(value);

    expect(patchDataMock).toHaveBeenCalledWith('item-id', {
      amount: 20,
      quantity: 3,
    });
  });

  it('updates total when updateBackend is called', () => {
    wrapper.vm.updateTotal();

    expect(wrapper.emitted('force-update')).toBeTruthy();
  });

  it('calculates the correct total', () => {
    wrapper.setData({
      tableItems: [
        { default_value: 10, default_quantity: 2 },
        { default_value: 5, default_quantity: 3 },
      ],
    });

    expect(wrapper.vm.total).toBe(40);
  });
});