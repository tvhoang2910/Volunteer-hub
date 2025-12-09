'use client';
import {
    Announcement,
    AnnouncementTag,
    AnnouncementTitle,
} from '@/components/ui/announcement';
import { ArrowUpRightIcon } from 'lucide-react';

const AnnouncementExamples = () => (
    <>
        <Announcement className="bg-rose-100 text-rose-700 border-rose-200">
            <AnnouncementTag className="bg-rose-200 text-rose-800">Error</AnnouncementTag>
            <AnnouncementTitle>
                Something went wrong
                <ArrowUpRightIcon className="shrink-0 opacity-70" size={16} />
            </AnnouncementTitle>
        </Announcement>

        <Announcement className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <AnnouncementTag className="bg-emerald-200 text-emerald-800">Success</AnnouncementTag>
            <AnnouncementTitle>
                New feature added
                <ArrowUpRightIcon className="shrink-0 opacity-70" size={16} />
            </AnnouncementTitle>
        </Announcement>

        <Announcement className="bg-orange-100 text-orange-700 border-orange-200">
            <AnnouncementTag className="bg-orange-200 text-orange-800">Warning</AnnouncementTag>
            <AnnouncementTitle>
                Approaching your limit
                <ArrowUpRightIcon className="shrink-0 opacity-70" size={16} />
            </AnnouncementTitle>
        </Announcement>

        <Announcement className="bg-sky-100 text-sky-700 border-sky-200">
            <AnnouncementTag className="bg-sky-200 text-sky-800">Info</AnnouncementTag>
            <AnnouncementTitle>
                Welcome to the platform
                <ArrowUpRightIcon className="shrink-0 opacity-70" size={16} />
            </AnnouncementTitle>
        </Announcement>
    </>
);

export default AnnouncementExamples;
