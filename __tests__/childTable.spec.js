// import { mount } from '@vue/test-utils';
import YourComponent from '../src/components/adderTable/components/ChildTable.vue';
// import { mount } from '@vue/test-utils';
// import YourComponent from './YourComponent.vue';

import { shallowMount } from '@vue/test-utils';
// import YourComponent from 'path/to/YourComponent';

describe('YourComponent', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(YourComponent, {
      propsData: {
        items: [], // provide sample data for items
        tableHeaders: [], // provide sample data for tableHeaders
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('renders the component properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the option to delete an item', () => {
    // Mock data
    const data = {
      id: 1,
      // provide other required properties for the data object
    };

    // Trigger the delete mode
    wrapper.vm.deleteMode(data);

    // Check if the delete mode is enabled and the confirmation dialog is shown
    expect(wrapper.vm.delete).toBe(true);
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(true);
    expect(wrapper.vm.info).toBe('Are you sure you want to delete this Item?');
    expect(wrapper.vm.addedData).toBe(data);
  });


  it('calculates the total correctly', () => {
    // Mock data
    const quantity = 5;
    const value = 10;
    const type = 'percentage_of_system_cost';

    // Calculate the total
    const total = wrapper.vm.calculateTotal(quantity, value, type);

    // Check if the total is calculated correctly
    expect(total).toBe(quantity * ((value / 100) * 10000));
  });

  it('deletes an item and emits the deleteData event', () => {
    // Mock data
    const item = {
      id: 1,
      // provide other required properties for the item object
    };
    wrapper.setData({ items: [item] });

    // Trigger the confirmDelete method
    wrapper.vm.confirmDelete(item);

    // Check if the item is deleted and the deleteData event is emitted
    expect(wrapper.vm.items.length).toBe(0);
    expect(wrapper.emitted('deleteData')).toBeTruthy();
    expect(wrapper.emitted('deleteData')[0][0]).toBe(item.id);
  });

  it('displays the currency symbol correctly', () => {
    // Mock data
    const countryCode = {
      currency_code: 'USD', // provide currency code
    };
    wrapper.setData({ countryCode });

    // Get the currency symbol
    const currencySymbol = wrapper.vm.handleCurrencySymbol;

    // Check if the currency symbol is retrieved correctly
    expect(currencySymbol).toBe('$'); // adjust the expectation according to your currency symbol
  });

  // Add more test cases as needed
});