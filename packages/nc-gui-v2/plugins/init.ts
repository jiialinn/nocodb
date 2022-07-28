import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { defineNuxtPlugin } from '#app'

dayjs.extend(duration)

const handleFeedbackForm = async () => {
  let { feedbackForm: currentFeedbackForm } = $(useGlobalState())
  if (!currentFeedbackForm) return

  const { $api } = useNuxtApp()

  const fetchFeedbackForm = async (now: Dayjs) => {
    try {
      const { data: feedbackForm } = await $api.instance.get('/api/v1/feedback_form')
      const isFetchedFormDuplicate = currentFeedbackForm.url === feedbackForm.url

      currentFeedbackForm = {
        url: feedbackForm.url,
        lastFormPollDate: now.toISOString(),
        createdAt: feedbackForm.created_at,
        isHidden: isFetchedFormDuplicate ? currentFeedbackForm.isHidden : false,
      }
    } catch (e) {
      console.error(e)
    }
  }

  const isFirstTimePolling = !currentFeedbackForm.lastFormPollDate

  const now = dayjs()
  const lastFormPolledDate = dayjs(currentFeedbackForm.lastFormPollDate)

  if (isFirstTimePolling || dayjs.duration(now.diff(lastFormPolledDate)).days() > 0) {
    await fetchFeedbackForm(now)
  }
}

const handleInitFunctions = async () => {
  await handleFeedbackForm()
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(handleInitFunctions)
})
