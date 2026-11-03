import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/theme/theme-provider';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayEvent = { id: string; title: string; time: string };

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildSampleEvents(year: number, month: number) {
  const events: Record<string, DayEvent[]> = {};
  const mid = Math.min(15, daysInMonth(year, month));
  const next = Math.min(mid + 3, daysInMonth(year, month));
  events[dateKey(year, month, mid)] = [
    { id: 'standup', title: 'Team standup', time: '9:30 AM' },
    { id: 'design', title: 'UI review', time: '2:00 PM' },
  ];
  events[dateKey(year, month, next)] = [{ id: 'ship', title: 'Ship checklist', time: '11:00 AM' }];
  const today = new Date();
  if (today.getFullYear() === year && today.getMonth() === month) {
    const key = dateKey(year, month, today.getDate());
    events[key] = [...(events[key] ?? []), { id: 'today', title: 'Today’s focus', time: 'All day' }];
  }
  return events;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function dayLabel(year: number, month: number, day: number) {
  return new Date(year, month, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function CalendarScreen() {
  const { colors, motion, radius, spacing } = useAppTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const eventsByDay = useMemo(() => buildSampleEvents(year, month), [year, month]);
  const cells = useMemo(() => {
    const leading = startWeekday(year, month);
    const total = daysInMonth(year, month);
    const blanks = Array.from({ length: leading }, () => null);
    const days = Array.from({ length: total }, (_, index) => index + 1);
    return [...blanks, ...days];
  }, [year, month]);

  const selectedKey = dateKey(year, month, selectedDay);
  const selectedEvents = eventsByDay[selectedKey] ?? [];
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  function goMonth(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
    const maxDay = daysInMonth(next.year, next.month);
    setSelectedDay((day) => Math.min(day, maxDay));
  }

  return (
    <Screen hasHeader contentStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => goMonth(-1)}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? motion.opacity.pressed : 1,
          })}>
          <Icon name="chevronLeft" size={18} color={colors.text} />
        </Pressable>
        <AppText variant="subtitle">{monthLabel(year, month)}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => goMonth(1)}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? motion.opacity.pressed : 1,
          })}>
          <Icon name="chevronRight" size={18} color={colors.text} />
        </Pressable>
      </View>

      <Card style={{ gap: spacing.md, paddingVertical: spacing.md }}>
        <View style={{ flexDirection: 'row' }}>
          {WEEKDAYS.map((label) => (
            <View key={label} style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.xs }}>
              <AppText variant="caption" tone="muted">
                {label}
              </AppText>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((day, index) => {
            if (day == null) {
              return <View key={`empty-${index}`} style={{ width: '14.2857%', height: 44 }} />;
            }

            const key = dateKey(year, month, day);
            const hasEvents = (eventsByDay[key]?.length ?? 0) > 0;
            const selected = day === selectedDay;
            const isToday = isCurrentMonth && day === now.getDate();

            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={dayLabel(year, month, day)}
                onPress={() => setSelectedDay(day)}
                style={{
                  width: '14.2857%',
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.pill,
                    backgroundColor: selected ? colors.primary : isToday ? colors.primarySoft : 'transparent',
                  }}>
                  <AppText
                    variant="caption"
                    style={{ color: selected ? colors.primaryForeground : colors.text }}>
                    {day}
                  </AppText>
                </View>
                {hasEvents ? (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      width: 5,
                      height: 5,
                      borderRadius: radius.pill,
                      backgroundColor: selected ? colors.primaryForeground : colors.primary,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="eyebrow">{dayLabel(year, month, selectedDay)}</AppText>
        <Card style={{ gap: spacing.md }}>
          {selectedEvents.length === 0 ? (
            <View style={{ gap: spacing.xs }}>
              <AppText variant="subtitle">No events</AppText>
              <AppText tone="muted">Replace this sample list with your calendar API or local store.</AppText>
            </View>
          ) : (
            selectedEvents.map((event) => (
              <View key={event.id} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.md,
                    backgroundColor: colors.surfaceStrong,
                  }}>
                  <Icon name="calendar" size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="subtitle">{event.title}</AppText>
                  <AppText variant="caption" tone="muted">
                    {event.time}
                  </AppText>
                </View>
              </View>
            ))
          )}
        </Card>
      </View>
    </Screen>
  );
}
