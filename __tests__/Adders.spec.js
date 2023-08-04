import { shallowMount } from '@vue/test-utils';
import Adders from '../src/pages/AND/Adder.vue'

describe('Adders', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Adders, {
      propsData: {
        handleClose: jest.fn(),
        selectedData: {},
        selectedOption: 'option',
        mode: 'edit',
        form: {},
        permissions: {},
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('should set initial data correctly', () => {
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(false);
    expect(wrapper.vm.info).toBe('');
    expect(wrapper.vm.selectedSwitchValue).toBe('');
    expect(wrapper.vm.formData).toEqual({
      id:''||undefined,
      name: '',
      rate_type: '',
      sub_type: '',
      default_amount: '',
      type: '',
      allow_amount_edit: ''||false,
      allow_quantity_edit: ''||false,
      is_homeowner_facing: ''||false,
      show_adder_total: ''||false,
      apply_incentives: ''||false,
    });
    expect(wrapper.vm.formRules).toEqual({});
  });

  it('should watch selectedData and update formData', async () => {
    await wrapper.setProps({
      selectedData: {
        
        name: 'Test Name',
        default_amount: 100,
        rate_type: 'Percentage',
        type: 'Type',
        allow_amount_edit: true,
        allow_quantity_edit: true,
        is_homeowner_facing: true,
        show_adder_total: true,
        apply_incentives: true,
      },
    });

    expect(wrapper.vm.formData.name).toBe('Test Name');
    expect(wrapper.vm.formData.default_amount).toBe(100);
    expect(wrapper.vm.formData.rate_type).toBe('Percentage');
    expect(wrapper.vm.formData.type).toBe('Type');
    expect(wrapper.vm.formData.allow_amount_edit).toBe(true);
    expect(wrapper.vm.formData.allow_quantity_edit).toBe(true);
    expect(wrapper.vm.formData.is_homeowner_facing).toBe(true);
    expect(wrapper.vm.formData.show_adder_total).toBe(true);
    expect(wrapper.vm.formData.apply_incentives).toBe(true);
  });

  it('should watch mode and call initializeFormData when mode is "adder"', async () => {
    const initializeFormDataSpy = jest.spyOn(wrapper.vm, 'initializeFormData');

    await wrapper.setProps({ mode: 'adder' });
    expect(initializeFormDataSpy).toHaveBeenCalledTimes(1);

    initializeFormDataSpy.mockClear();

  });
  it('should watch mode and call initializeFormData when mode is "discount"', async () => {
    const initializeFormDataSpy = jest.spyOn(wrapper.vm, 'initializeFormData');

    await wrapper.setProps({ mode: 'discount' });
    expect(initializeFormDataSpy).toHaveBeenCalledTimes(1);

    initializeFormDataSpy.mockRestore();
  });

  it('initializes form data when mode is "adder" or "discount"', () => {
    const wrapper = shallowMount(Adders, {
      propsData: {
        handleClose: jest.fn(),
        selectedData: {},
        selectedOption: '',
        mode: 'adder',
        form: {},
        permissions: {}
      }
    });

    // Assert the initialization of form data when mode is "Adder"
    // Example: expect(wrapper.vm.formData.name).toBe('');

    // Update the mode prop
    wrapper.setProps({ mode: 'discount' });

    // Assert the initialization of form data when mode is "Discount"
    // Example: expect(wrapper.vm.formData.name).toBe('');
  });
  it('should call deleteMode and set isDeleteProjectDocumentPopupOpen to true', () => {
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(false);
    wrapper.vm.deleteMode();
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(true);
    expect(wrapper.vm.info).toBe('Are you sure you want to delete this Adder?');
  });
  it('sets isDeleteProjectDocumentPopupOpen to true and info value', () => {
    const wrapper = shallowMount(Adders, {
      propsData: {
        handleClose: jest.fn(),
        selectedData: {},
        selectedOption: '',
        mode: '',
        form: {},
        permissions: {}
      }
    });

    // Trigger the deleteMode method
    wrapper.vm.deleteMode();

    // Assert the changes in data properties
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(true);
    expect(wrapper.vm.info).toBe('Are you sure you want to delete this Adder?');
  });
  it('emits "delete" event and calls handleClose method', () => {
    const wrapper = shallowMount(Adders, {
      propsData: {
        handleClose: jest.fn(),
        selectedData: { id: 1 },
        selectedOption: '',
        mode: '',
        form: {},
        permissions: {}
      }
    });

    // Set up a spy on the $emit method
    const emitSpy = jest.spyOn(wrapper.vm, '$emit');

    // Trigger the confirmDelete method
    wrapper.vm.confirmDelete();

    // Assert the emitted event and method call
    expect(emitSpy).toHaveBeenCalledWith('delete', { id: 1 });
    expect(wrapper.vm.handleClose).toHaveBeenCalled();
  });
  it('should call handleBack and set mode to "view"', () => {
    expect(wrapper.vm.mode).toBe('edit');
    wrapper.vm.handleBack();
    expect(wrapper.vm.mode).toBe('view');
  });

  it('should call confirmDelete and emit "delete" event', () => {
    const deleteSpy = jest.spyOn(wrapper.vm, '$emit');
    wrapper.vm.confirmDelete(true);
    expect(deleteSpy).toHaveBeenCalledWith('delete', wrapper.vm.selectedData);
    expect(wrapper.vm.handleClose).toHaveBeenCalled();
    deleteSpy.mockRestore();
  });

  it('should call handleCancel and set isDeleteProjectDocumentPopupOpen to true with info message', () => {
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(false);
    wrapper.vm.handleCancel();
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(true);
    expect(wrapper.vm.info).toBe('Canceling will discard unsaved changes. Continue?');
  });

  it('should call cancelDelete and set isDeleteProjectDocumentPopupOpen to false', () => {
    wrapper.vm.isDeleteProjectDocumentPopupOpen = true;
    wrapper.vm.cancelDelete();
    expect(wrapper.vm.isDeleteProjectDocumentPopupOpen).toBe(false);
  });

  it('should call initializeFormData and reset form data', () => {
    wrapper.vm.initializeFormData();
    expect(wrapper.vm.formData.name).toBe('');
    expect(wrapper.vm.formData.default_amount).toBe('');
    expect(wrapper.vm.formData.rate_type).toBe('');
    expect(wrapper.vm.formData.sub_type).toBe('');
    expect(wrapper.vm.formData.type).toBe('edit');
    expect(wrapper.vm.formData.allow_amount_edit).toBe(false);
    expect(wrapper.vm.formData.allow_quantity_edit).toBe(false);
    expect(wrapper.vm.formData.is_homeowner_facing).toBe(false);
    expect(wrapper.vm.formData.show_adder_total).toBe(false);
    expect(wrapper.vm.formData.apply_incentives).toBe(false);
  });

  it('should call cancelEdit and set mode to "view"', () => {
    expect(wrapper.vm.mode).toBe('edit');
    wrapper.vm.cancelEdit();
    expect(wrapper.vm.mode).toBe('view');
  });
  it('renders correctly when mode is "view"', () => {
    const wrapper = shallowMount(Adders, {
      propsData: {
        mode: 'view',
        permissions:{isAdmin:true},
        selectedData: { type: 'Adder' },
        form: { heading1: 'Discount Details' ||'Adders Details' },
      },
    });
    
    expect(wrapper.find('h2').text()).toBe('Discount Details' ||'Adders Details');
    expect(wrapper.find('.el-icon-edit').exists()).toBe(true);
    expect(wrapper.find('.el-icon-delete').exists()).toBe(true);
  });

  it('renders correctly when mode is "edit"', () => {
    const wrapper = shallowMount(Adders, {
      propsData: {
        mode: 'edit',
        selectedData: { type: 'Adder' },
        form: { heading: 'Edit Discount'||'Edit Adder' },
      },
    });
    
    expect(wrapper.find('h2').text()).toBe( 'Edit Discount'||'Edit Adder');
  });

  // it('renders correctly when mode is "Adder"', () => {
  //   const wrapper = shallowMount(Adders, {
  //     propsData: {
  //       mode: 'Adder',
  //       selectedData: { type: 'Adder' },
  //       adderTitle:'Create Adder'      },
  //   });
    
  //   expect(wrapper.find('h2').text()).toBe('Create Adder');
  //   expect(wrapper.find('.el-icon-back').exists()).toBe(true);
  // });

  // it('renders correctly when mode is "Discount"', () => {
  //   const wrapper = shallowMount(Adders, {
  //     propsData: {
  //       mode: 'Discount',
  //       selectedData: { type: 'Discount' },
  //     },
  //   });
    
  //   expect(wrapper.find('h2').text()).toBe('Discount Details');
  //   expect(wrapper.find('.el-icon-back').exists()).toBe(true);
  // });

  it('emits "updateData" event when form is valid and Submit button is clicked', async () => {
    const wrapper = shallowMount(Adders, {
      propsData: {
        mode: 'edit',
        selectedData: { type: 'Adder' },
        form: { heading: 'Form Heading' },
      },
    });
    
    wrapper.vm.$refs.form.validate = jest.fn((callback) => {
      callback(true);
    });

    wrapper.find('el-button[type="primary"]').trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('updateData')).toBeTruthy();
  });

  // it('emits "submit" event when form is valid and Save button is clicked', async () => {
  //   const wrapper = shallowMount(Adders, {
  //     propsData: {
  //       mode: 'Adder',
  //       selectedData: { type: 'Adder' },
  //     },
  //   });
    
  //   wrapper.vm.$refs.form.validate = jest.fn((callback) => {
  //     callback(true);
  //   });

  //   wrapper.find('el-button[type="primary"]').trigger('click');

  //   await wrapper.vm.$nextTick();

  //   expect(wrapper.emitted('submit')).toBeTruthy();
  // });

  // Add more test cases for other methods and functionality
});


