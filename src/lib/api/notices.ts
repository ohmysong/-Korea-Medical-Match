import { apiFetch } from './client'
import type { DeletedResponse, Notice, NoticeImage, NoticeImageInput, NoticeInput } from './types'

const BASE = '/admin/notices'

export function listNotices() {
  return apiFetch<Notice[]>(BASE, { auth: false })
}

export function getNotice(id: string) {
  return apiFetch<Notice>(`${BASE}/${encodeURIComponent(id)}`, { auth: false })
}

export function createNotice(input: NoticeInput & { id: string }) {
  return apiFetch<Notice>(BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateNotice(id: string, input: NoticeInput) {
  return apiFetch<Notice>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteNotice(id: string) {
  return apiFetch<DeletedResponse>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function listNoticeImages(noticeId: string) {
  return apiFetch<NoticeImage[]>(`${BASE}/${encodeURIComponent(noticeId)}/images`, { auth: false })
}

export function createNoticeImage(noticeId: string, input: NoticeImageInput) {
  return apiFetch<NoticeImage>(`${BASE}/${encodeURIComponent(noticeId)}/images`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateNoticeImage(noticeId: string, imageId: number, input: NoticeImageInput) {
  return apiFetch<NoticeImage>(`${BASE}/${encodeURIComponent(noticeId)}/images/${imageId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteNoticeImage(noticeId: string, imageId: number) {
  return apiFetch<DeletedResponse>(`${BASE}/${encodeURIComponent(noticeId)}/images/${imageId}`, {
    method: 'DELETE',
  })
}
