<template>

      <div class="modal add_panel_modal" id="make_panel">
      <div class="modal-overlay modal-toggle" data-dismiss="modal"></div>
      <div class="modal-wrapper">
        <div class="modal-content">
          <div class="modal-header">
            <h4>Add Module</h4>
            <button class="modal-close modal-toggle" data-dismiss="modal">
              <span class="close"></span>
            </button>
          </div>
          <div class="add_panel_content">
            <aside class="panel_types">
              <ul class="type_items">
                <li class="active">
                  <a href="javascript:void(0);" data-dismiss="modal">Make</a>
                </li>
                <li>
                  <a href="javascript:void(0);" data-toggle="modal" data-dismiss="modal" data-target="#physical_panel">Physical</a>
                </li>
                <li>
                  <a href="javascript:void(0);" data-toggle="modal" data-dismiss="modal" data-target="#electrical_panel">Electrical</a>
                </li>
              </ul>
            </aside>
            <div class="right_aside">
              <div class="inside_form">
                <div class="floating-form">
                  <div class="col_row">
                    <div class="col">
                      <div class="floating-label">
                        <input class="floating-input" type="text" placeholder=" " value="" />
                        <label>Company Name*</label>
                      </div>
                    </div>
                    <div class="col">
                      <div class="floating-label">
                        <input class="floating-input" type="text" placeholder=" " value="" />
                        <label>Series* </label>
                      </div>
                    </div>
                  </div>
                  <div class="col_row">
                    <div class="col">
                      <div class="floating-label">
                        <input class="floating-input" type="text" placeholder=" " value="" />
                        <label>Region</label>
                      </div>
                    </div>
                    <div class="col">
                      <div class="floating-label">
                        <input class="floating-input" type="text" placeholder=" " value="" />
                        <label>Model* </label>
                      </div>
                    </div>
                  </div>
                  <div class="col_row">
                    <div class="col">
                      <div class="floating-label">
                        <input class="floating-input" type="text" placeholder=" " value="" />
                        <label>Datasheet Link</label>
                      </div>
                    </div>
                    <div class="col">
                      <div class="floating-label">
                        <input class="floating-input" type="text" placeholder=" " value="" />
                        <label>Source</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form_footer">
                <div class="sumbmit_btn">
                  <div class="upload_files btn btn-outline">
                    <input type="file" />
                    Upload OND File
                  </div>
                  <input class="btn btn-primary" type="submit" value="Add Panel" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
</template>


<script>
export default {
    
    props :{
        addPanelVisible : Boolean,
    },

    mounted(){
        console.log("inside popup");
        console.log(addPanelVisible);
    },
}
</script>


<style scoped>
/* @import url(../styles/styles.css); */
</style>