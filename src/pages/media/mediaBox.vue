<template>
	<div id="app" @mousemove="showControls()">
		<div>
			<!-- <ul
          style="margin: 0; padding: 0"
        >
          <li
            v-for="(image, index) in media"
            :key="index"
            style="display: inline-block; margin: 0 5px 5px 0"
          >
            <img
              :src="image.thumb"
              style="height: 100px; cursor: pointer"
              @click="openGallery(index)"
            >
          </li>
        </ul> -->

			<LightBox ref="lightbox" :media="media" :show-caption="true" :show-light-box="false" :closable="false" />
		</div>
	</div>
</template>
  
<script>
import LightBox from 'vue-it-bigger'
import('vue-it-bigger/dist/vue-it-bigger.min.css')
import { DATABASE_URL } from '../../constants';

export default {
	components: {
		LightBox,
	},
	data() {
		return {
			media: [],
			designId: this.$route.params.designId,
		}
	},
	async mounted() {
		await this.getData();
		this.openGallery(0);
	},
	methods: {
		openGallery(index) {
			this.$refs.lightbox.showImage(index);
		},
		showControls() {
			if (this.$refs.lightbox.controlsHidden) {
				this.$refs.lightbox.controlsHidden = false
			}
		},
		async getData() {
			try {
				const survey_Id = this.$route.params.surveyId;

				const user = JSON.parse(localStorage.getItem('user')) || {};
				const { token } = user;

				const myHeaders = new Headers();
				myHeaders.append("authorization", `Token ${token}`);


				const requestOptions = {
					method: 'GET',
					headers: myHeaders,
					redirect: 'follow'
				};

				const URL = `${DATABASE_URL}api/site-survey-details/${survey_Id}/`;

				await fetch(URL, requestOptions)
					.then(response => response.text())
					.then(result => {
						const data = JSON.parse(result);
						const surveyDetails = data.site_survey_details;

						data.map_image_url.forEach((file) => {
							if (file.file_type === 'image') {
								const image = {};

								image.src = file.file_url;
								image.caption = file.file_info;
								image.thumb = file.file_url;

								this.media.push(
									image
								)
							} 
						})
						surveyDetails.forEach((element) => {
							const files = element.files

							files.forEach((file) => {
								if (file.file_type === 'image') {
									const image = {};

									image.src = file.file_url;
									image.caption = file.file_info;
									image.thumb = file.file_url;

									this.media.push(
										image
									)
								} 
								else if(file.file_type === 'video') {
									const video = {
										sources: [
											{
												src: file.file_url,
												type: 'video/mp4',
											},
										],
										type: 'video',
										caption: file.file_info,
										width: 800,
										height: 600,
									}

									this.media.push(video)
								}
							})
						})
					})
					.catch(error => console.log('error', error));

			}
			catch (e) {
				console.log('e: ', e);
			}
		},
	}
}
</script>